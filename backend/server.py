from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone
from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# LLM API Key
EMERGENT_LLM_KEY = os.environ.get('EMERGENT_LLM_KEY')

# ===== MODELS =====

class User(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    total_modules_completed: int = 0
    current_streak: int = 0
    total_courses: int = 0
    level: int = 1
    badges: List[str] = []

class CourseRequest(BaseModel):
    username: str
    topic: str
    skill_level: str  # "Beginner" or "Intermediate"
    learning_goal: Optional[str] = None

class Module(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    content: str
    examples: List[str]
    key_points: List[str]

class QuizQuestion(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    question: str
    options: List[str]
    correct_answer: int  # index of correct option

class Quiz(BaseModel):
    module_id: str
    questions: List[QuizQuestion]

class Course(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str
    topic: str
    skill_level: str
    learning_goal: Optional[str] = None
    modules: List[Module] = []
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    current_module_index: int = 0
    completed: bool = False

class QuizSubmission(BaseModel):
    username: str
    course_id: str
    module_id: str
    answers: List[int]  # indices of selected options

class QuizResult(BaseModel):
    score: int
    total: int
    percentage: float
    passed: bool
    feedback: str
    correct_answers: List[int]

class Progress(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    username: str
    course_id: str
    module_id: str
    quiz_score: Optional[int] = None
    quiz_total: Optional[int] = None
    attempts: int = 0
    completed: bool = False
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class TutorMessage(BaseModel):
    username: str
    course_id: str
    module_id: Optional[str] = None
    message: str
    context: Optional[str] = None  # "learning", "quiz", "teaching", "general"

class TutorResponse(BaseModel):
    response: str
    encouragement: str

class SimplifyRequest(BaseModel):
    username: str
    course_id: str
    module_id: str
    difficulty_areas: Optional[List[str]] = None

class TeachingSubmission(BaseModel):
    username: str
    course_id: str
    module_id: str
    explanation: str

class TeachingFeedback(BaseModel):
    feedback: str
    quality_score: int  # 1-10
    suggestions: List[str]
    can_proceed: bool


# ===== HELPER FUNCTIONS =====

def get_llm_chat(system_message: str, session_id: str) -> LlmChat:
    """Initialize LLM chat with system message"""
    chat = LlmChat(
        api_key=EMERGENT_LLM_KEY,
        session_id=session_id,
        system_message=system_message
    )
    chat.with_model("openai", "gpt-5.1")
    return chat

# ===== API ENDPOINTS =====

@api_router.post("/user/register", response_model=User)
async def register_user(username: str):
    """Register a new user or return existing"""
    existing_user = await db.users.find_one({"username": username}, {"_id": 0})
    if existing_user:
        if isinstance(existing_user.get('created_at'), str):
            existing_user['created_at'] = datetime.fromisoformat(existing_user['created_at'])
        return User(**existing_user)
    
    user = User(username=username)
    doc = user.model_dump()
    doc['created_at'] = doc['created_at'].isoformat()
    await db.users.insert_one(doc)
    return user

@api_router.get("/user/{username}", response_model=User)
async def get_user(username: str):
    """Get user profile"""
    user = await db.users.find_one({"username": username}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if isinstance(user.get('created_at'), str):
        user['created_at'] = datetime.fromisoformat(user['created_at'])
    return User(**user)

@api_router.post("/course/generate", response_model=Course)
async def generate_course(request: CourseRequest):
    """Generate a complete course with modules using AI"""
    
    system_message = f"""You are an expert educational content creator. Generate a personalized learning course for {request.username}.
    
Topic: {request.topic}
Skill Level: {request.skill_level}
Learning Goal: {request.learning_goal or 'General understanding'}

Create a course with 5 progressive modules. Each module should:
1. Have a clear, engaging title
2. Contain simple explanations (2-3 paragraphs, beginner-friendly language)
3. Include 2-3 practical examples
4. List 3-4 key takeaway points

Make content adaptive to the skill level and use encouraging, friendly language.
Format your response as JSON with this structure:
{{
    "modules": [
        {{
            "title": "Module title",
            "content": "Detailed explanation...",
            "examples": ["Example 1", "Example 2"],
            "key_points": ["Point 1", "Point 2", "Point 3"]
        }}
    ]
}}
"""
    
    try:
        chat = get_llm_chat(system_message, f"course_gen_{request.username}_{uuid.uuid4()}")
        prompt = f"Generate a complete {request.skill_level} level course on '{request.topic}' with 5 modules. Return only valid JSON."
        
        response = await chat.send_message(UserMessage(text=prompt))
        
        # Parse the AI response
        import json
        # Extract JSON from response (handling markdown code blocks)
        response_text = response.strip()
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()
        
        course_data = json.loads(response_text)
        
        # Create course object
        modules = [Module(**mod) for mod in course_data['modules']]
        course = Course(
            username=request.username,
            topic=request.topic,
            skill_level=request.skill_level,
            learning_goal=request.learning_goal,
            modules=modules
        )
        
        # Save to database
        doc = course.model_dump()
        doc['created_at'] = doc['created_at'].isoformat()
        await db.courses.insert_one(doc)
        
        # Update user stats
        await db.users.update_one(
            {"username": request.username},
            {"$inc": {"total_courses": 1}}
        )
        
        return course
        
    except Exception as e:
        logging.error(f"Course generation error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate course: {str(e)}")

@api_router.post("/quiz/generate", response_model=Quiz)
async def generate_quiz(course_id: str, module_id: str):
    """Generate quiz questions for a module"""
    
    # Get course and module
    course = await db.courses.find_one({"id": course_id}, {"_id": 0})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    module = next((m for m in course['modules'] if m['id'] == module_id), None)
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    
    system_message = f"""You are a quiz generator. Create 5 multiple-choice questions based on the module content.
    
Module: {module['title']}
Content: {module['content']}

Generate questions that test understanding, not just memorization. Each question should have 4 options with only one correct answer.

Return ONLY valid JSON with this exact structure:
{{
    "questions": [
        {{
            "question": "Question text?",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "correct_answer": 0
        }}
    ]
}}
"""
    
    try:
        chat = get_llm_chat(system_message, f"quiz_gen_{module_id}")
        response = await chat.send_message(UserMessage(text="Generate 5 quiz questions. Return only valid JSON."))
        
        import json
        response_text = response.strip()
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()
        
        quiz_data = json.loads(response_text)
        questions = [QuizQuestion(**q) for q in quiz_data['questions']]
        
        return Quiz(module_id=module_id, questions=questions)
        
    except Exception as e:
        logging.error(f"Quiz generation error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to generate quiz: {str(e)}")

@api_router.post("/quiz/submit", response_model=QuizResult)
async def submit_quiz(submission: QuizSubmission):
    """Evaluate quiz submission"""
    
    # Get the quiz questions (regenerate for checking)
    course = await db.courses.find_one({"id": submission.course_id}, {"_id": 0})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    # For now, we'll store correct answers in a separate collection
    # In production, you'd want to cache the generated quiz
    
    # Calculate score (this is simplified - in production, retrieve actual quiz)
    total = len(submission.answers)
    score = 0  # This should be calculated against actual correct answers
    
    # For demo purposes, let's use a mock scoring
    # In production, you'd compare against stored quiz
    score = sum(1 for _ in submission.answers if _ >= 0)  # Placeholder
    percentage = (score / total) * 100 if total > 0 else 0
    passed = percentage >= 60
    
    # Generate personalized feedback
    user = await db.users.find_one({"username": submission.username}, {"_id": 0})
    username = user.get('username', 'Learner') if user else 'Learner'
    
    if passed:
        feedback = f"Excellent work, {username}! You scored {percentage:.0f}%. You've shown great understanding. Ready to move forward! 🎉"
    else:
        feedback = f"It's okay, {username}. You scored {percentage:.0f}%. Learning takes time. Let's simplify this concept and try again. You've got this! 💪"
    
    # Save progress
    progress = Progress(
        username=submission.username,
        course_id=submission.course_id,
        module_id=submission.module_id,
        quiz_score=score,
        quiz_total=total,
        attempts=1,
        completed=passed
    )
    
    # Update or insert progress
    existing = await db.progress.find_one({
        "username": submission.username,
        "module_id": submission.module_id
    })
    
    if existing:
        await db.progress.update_one(
            {"username": submission.username, "module_id": submission.module_id},
            {
                "$set": {
                    "quiz_score": score,
                    "quiz_total": total,
                    "completed": passed,
                    "timestamp": datetime.now(timezone.utc).isoformat()
                },
                "$inc": {"attempts": 1}
            }
        )
    else:
        doc = progress.model_dump()
        doc['timestamp'] = doc['timestamp'].isoformat()
        await db.progress.insert_one(doc)
    
    # Update user stats if passed
    if passed:
        await db.users.update_one(
            {"username": submission.username},
            {"$inc": {"total_modules_completed": 1}}
        )
    
    return QuizResult(
        score=score,
        total=total,
        percentage=percentage,
        passed=passed,
        feedback=feedback,
        correct_answers=[0] * total  # Placeholder
    )

@api_router.post("/tutor/ask", response_model=TutorResponse)
async def ask_tutor(message: TutorMessage):
    """Get help from AI tutor"""
    
    context_info = ""
    if message.module_id:
        course = await db.courses.find_one({"id": message.course_id}, {"_id": 0})
        if course:
            module = next((m for m in course['modules'] if m['id'] == message.module_id), None)
            if module:
                context_info = f"\nCurrent Module: {module['title']}\nContent: {module['content'][:500]}..."
    
    system_message = f"""You are a friendly, encouraging AI tutor helping {message.username} learn.
    
Your role:
- Answer questions clearly and simply
- Provide hints, not direct answers to quiz questions
- Use encouraging, motivating language
- Keep responses concise (2-3 sentences)
- Adapt to the learner's level

Context: {message.context or 'general learning'}
{context_info}

Always address {message.username} by name and be supportive!
"""
    
    try:
        chat = get_llm_chat(system_message, f"tutor_{message.username}_{message.course_id}")
        response = await chat.send_message(UserMessage(text=message.message))
        
        # Generate encouragement
        encouragements = [
            f"You're doing great, {message.username}! Keep asking questions! 🌟",
            f"Great question, {message.username}! Curiosity leads to learning! 🚀",
            f"I'm here to help, {message.username}! You're making progress! 💪",
            f"Excellent thinking, {message.username}! Keep it up! ✨"
        ]
        
        import random
        encouragement = random.choice(encouragements)
        
        return TutorResponse(response=response, encouragement=encouragement)
        
    except Exception as e:
        logging.error(f"Tutor error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get tutor response")

@api_router.post("/module/simplify", response_model=Module)
async def simplify_module(request: SimplifyRequest):
    """Regenerate module with simpler explanations"""
    
    course = await db.courses.find_one({"id": request.course_id}, {"_id": 0})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    module = next((m for m in course['modules'] if m['id'] == request.module_id), None)
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    
    system_message = f"""You are an expert at simplifying complex topics. Rewrite this module to be even simpler for {request.username}.

Original Module: {module['title']}
Original Content: {module['content']}

Make it:
- Use simpler words
- Add more examples
- Break down concepts step-by-step
- Use analogies and real-world connections

Return ONLY valid JSON:
{{
    "title": "Same title",
    "content": "Simplified explanation...",
    "examples": ["Example 1", "Example 2", "Example 3"],
    "key_points": ["Point 1", "Point 2", "Point 3"]
}}
"""
    
    try:
        chat = get_llm_chat(system_message, f"simplify_{request.module_id}")
        response = await chat.send_message(UserMessage(text="Simplify this module. Return only valid JSON."))
        
        import json
        response_text = response.strip()
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()
        
        module_data = json.loads(response_text)
        simplified_module = Module(id=request.module_id, **module_data)
        
        # Update in database
        await db.courses.update_one(
            {"id": request.course_id, "modules.id": request.module_id},
            {"$set": {
                "modules.$": simplified_module.model_dump()
            }}
        )
        
        return simplified_module
        
    except Exception as e:
        logging.error(f"Simplify error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to simplify module")

@api_router.post("/teaching/submit", response_model=TeachingFeedback)
async def submit_teaching(submission: TeachingSubmission):
    """Evaluate learner's explanation (teaching phase)"""
    
    course = await db.courses.find_one({"id": submission.course_id}, {"_id": 0})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    module = next((m for m in course['modules'] if m['id'] == submission.module_id), None)
    if not module:
        raise HTTPException(status_code=404, detail="Module not found")
    
    system_message = f"""You are evaluating {submission.username}'s understanding of: {module['title']}

Original content: {module['content']}
Their explanation: {submission.explanation}

Provide:
1. Encouraging feedback (2-3 sentences)
2. Quality score (1-10)
3. 2-3 specific suggestions for improvement
4. Whether they can proceed (true/false)

Return ONLY valid JSON:
{{
    "feedback": "Great effort, {submission.username}!...",
    "quality_score": 8,
    "suggestions": ["Suggestion 1", "Suggestion 2"],
    "can_proceed": true
}}
"""
    
    try:
        chat = get_llm_chat(system_message, f"teaching_{submission.module_id}")
        response = await chat.send_message(UserMessage(text="Evaluate this explanation. Return only valid JSON."))
        
        import json
        response_text = response.strip()
        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()
        
        feedback_data = json.loads(response_text)
        return TeachingFeedback(**feedback_data)
        
    except Exception as e:
        logging.error(f"Teaching evaluation error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to evaluate explanation")

@api_router.get("/progress/{username}")
async def get_user_progress(username: str):
    """Get user's learning progress and stats for graphs"""
    
    # Get all progress records
    progress_records = await db.progress.find(
        {"username": username},
        {"_id": 0}
    ).sort("timestamp", 1).to_list(1000)
    
    # Convert timestamps
    for record in progress_records:
        if isinstance(record.get('timestamp'), str):
            record['timestamp'] = datetime.fromisoformat(record['timestamp'])
    
    # Get user stats
    user = await db.users.find_one({"username": username}, {"_id": 0})
    
    # Get all courses
    courses = await db.courses.find({"username": username}, {"_id": 0}).to_list(1000)
    
    return {
        "user": user,
        "progress": progress_records,
        "courses": courses
    }

@api_router.get("/course/{course_id}")
async def get_course(course_id: str):
    """Get course by ID"""
    course = await db.courses.find_one({"id": course_id}, {"_id": 0})
    if not course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    if isinstance(course.get('created_at'), str):
        course['created_at'] = datetime.fromisoformat(course['created_at'])
    
    return course

@api_router.put("/course/{course_id}/module")
async def update_current_module(course_id: str, module_index: int):
    """Update current module index"""
    result = await db.courses.update_one(
        {"id": course_id},
        {"$set": {"current_module_index": module_index}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Course not found")
    
    return {"message": "Module updated", "current_index": module_index}

@api_router.put("/course/{course_id}/complete")
async def complete_course(course_id: str):
    """Mark course as completed"""
    result = await db.courses.update_one(
        {"id": course_id},
        {"$set": {"completed": True}}
    )
    
    if result.modified_count == 0:
        raise HTTPException(status_code=404, detail="Course not found")
    
    # Award badge
    course = await db.courses.find_one({"id": course_id}, {"_id": 0})
    if course:
        await db.users.update_one(
            {"username": course['username']},
            {"$addToSet": {"badges": f"Completed {course['topic']}"}}
        )
    
    return {"message": "Course completed! 🎉"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
