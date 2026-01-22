# LearnEye 👁️ - Adaptive AI Learning Platform

![LearnEye](https://img.shields.io/badge/LearnEye-AI_Powered_Learning-6366f1?style=for-the-badge)
![React](https://img.shields.io/badge/React-19.0-61dafb?style=flat-square&logo=react)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688?style=flat-square&logo=fastapi)
![MongoDB](https://img.shields.io/badge/MongoDB-Ready-47a248?style=flat-square&logo=mongodb)

## 🌟 Overview

**LearnEye** is a cutting-edge adaptive AI learning platform that creates personalized courses, adapts to your learning pace, and provides real-time AI tutoring. Built with the latest technologies and designed for an impressive learning experience.

### ✨ Key Features

- 🎯 **Personalized Learning** - AI generates custom courses based on your topic, skill level, and goals
- 🧠 **Adaptive Intelligence** - Content adjusts based on quiz performance (pass = advance, fail = simplify)
- 💬 **AI Tutor Assistant** - Real-time help available throughout your learning journey
- 📊 **Live Progress Graphs** - Visualize your learning path and performance over time
- 🎮 **Gamification** - Earn badges, track streaks, level up as you learn
- 👁️ **Animated Eye Logo** - Beautiful, responsive branding with smooth animations
- 📱 **Fully Responsive** - Works seamlessly on mobile, tablet, and desktop

## 🚀 Tech Stack

### Frontend
- **React 19.0** - Latest React with modern hooks
- **Tailwind CSS 3.4** - Utility-first styling with custom animations
- **Radix UI** - Accessible, unstyled component primitives
- **Recharts 3.6** - Beautiful, responsive charts for progress visualization
- **React Router 7.5** - Client-side routing
- **Axios** - HTTP client for API calls
- **Sonner** - Toast notifications

### Backend
- **FastAPI 0.110** - Modern, fast Python web framework
- **MongoDB** - NoSQL database for flexible data storage
- **Motor** - Async MongoDB driver
- **Emergent Integrations** - AI/LLM integration library
- **OpenAI GPT-5.1** - AI-powered course generation and tutoring

### AI Features
- **Course Generation** - AI creates 5-module personalized courses
- **Quiz Generation** - Automatic MCQ creation based on module content
- **AI Tutoring** - Context-aware conversational assistance
- **Content Simplification** - Adaptive difficulty based on performance
- **Teaching Evaluation** - AI evaluates learner explanations

## 📁 Project Structure

```
/app/
├── backend/
│   ├── server.py              # FastAPI application with all endpoints
│   ├── requirements.txt       # Python dependencies
│   └── .env                   # Environment variables (includes EMERGENT_LLM_KEY)
├── frontend/
│   ├── src/
│   │   ├── App.js            # Main React application with routing
│   │   ├── App.css           # Custom animations and styling
│   │   ├── components/
│   │   │   ├── EyeLogo.jsx   # Animated eye logo component
│   │   │   ├── AITutor.jsx   # Floating AI tutor widget
│   │   │   └── ui/           # Radix UI components
│   │   └── pages/
│   │       ├── WelcomeScreen.jsx       # Username capture
│   │       ├── TopicSelection.jsx      # Course creation
│   │       ├── LearningModule.jsx      # Module content display
│   │       ├── QuizScreen.jsx          # Interactive quizzes
│   │       ├── TeachingScreen.jsx      # Teaching phase
│   │       ├── ProgressDashboard.jsx   # Graphs and stats
│   │       └── CompletionScreen.jsx    # Course completion
│   ├── package.json          # Node dependencies
│   └── tailwind.config.js    # Tailwind configuration
└── README.md                 # This file
```

## 🎓 Learning Flow

1. **Welcome** → User enters their name for personalization
2. **Topic Selection** → Choose topic, skill level, and learning goals
3. **Course Generation** → AI creates 5 personalized modules
4. **Learning Module** → Read content, examples, and key points
5. **Quiz** → Answer 5 MCQ questions
6. **Adaptive Logic**:
   - ✅ Score ≥ 60% → Move to Teaching Phase
   - ❌ Score < 60% → Simplify content and retry
7. **Teaching Phase** → Explain concepts in your own words
8. **AI Feedback** → Get personalized feedback and suggestions
9. **Next Module** → Repeat until all 5 modules complete
10. **Completion** → Celebrate achievement and earn badges!

## 🔧 API Endpoints

### User Management
- `POST /api/user/register?username=` - Register or get existing user
- `GET /api/user/{username}` - Get user profile

### Course Management
- `POST /api/course/generate` - Generate AI course
- `GET /api/course/{course_id}` - Get course details
- `PUT /api/course/{course_id}/module?module_index=` - Update current module
- `PUT /api/course/{course_id}/complete` - Mark course complete

### Quiz & Assessment
- `POST /api/quiz/generate?course_id=&module_id=` - Generate quiz
- `POST /api/quiz/submit` - Submit quiz answers
- `POST /api/teaching/submit` - Submit teaching explanation

### AI Features
- `POST /api/tutor/ask` - Ask AI tutor for help
- `POST /api/module/simplify` - Get simplified version of module

### Progress Tracking
- `GET /api/progress/{username}` - Get learning stats and graph data

## 🎨 Design Highlights

### Animated Eye Logo
- Gradient background with glow effect
- Bouncing eye icon
- Rotating ring animation
- Sparkle effects for visual appeal

### Color Palette
- **Primary**: Indigo 600 to Purple 600 gradient
- **Success**: Green 500-600
- **Warning**: Yellow 500-600
- **Backgrounds**: Soft gradients from indigo-50 to purple-50

### Responsive Design
- Mobile-first approach
- Breakpoints: sm, md, lg, xl
- Touch-optimized interactions
- Adaptive layouts

## 📊 Progress Visualization

### Learning Path Graph
- Area chart showing module progression
- Tracks completion across all courses
- Visual journey representation

### Performance Graph
- Line chart of quiz scores over time
- Tracks improvement percentage
- Shows learning curve

## 🎮 Gamification Elements

- **Levels** - Progress through difficulty tiers
- **Badges** - Earn achievements for completing courses
- **Streaks** - Track daily learning consistency
- **Progress Bars** - Visual feedback on completion
- **Stats Dashboard** - Total courses, modules, and performance

## 🌐 Environment Variables

### Backend (.env)
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=learneye_db
CORS_ORIGINS=*
EMERGENT_LLM_KEY=sk-emergent-f059576E234B6AeD73
```

### Frontend (.env)
```env
REACT_APP_BACKEND_URL=<your-backend-url>
```

## 🚀 Deployment Ready

The platform is production-ready with:
- ✅ Hot reload for development
- ✅ Error handling and validation
- ✅ Toast notifications for user feedback
- ✅ Loading states and animations
- ✅ Data persistence in MongoDB
- ✅ RESTful API design
- ✅ Responsive UI for all devices
- ✅ AI-powered adaptive learning

## 🎯 User Experience Highlights

### Personalization
- Uses learner's name throughout the experience
- Motivational messages tailored to individual
- Encouraging feedback on both success and failure

### Accessibility
- High contrast colors
- Clear typography
- Keyboard navigation support
- Screen reader friendly (via Radix UI)

### Performance
- Fast page loads
- Smooth animations (60fps)
- Optimized API calls
- Efficient state management

## 🔮 Future Enhancements (Roadmap)

- [ ] Voice-based AI tutor
- [ ] Multi-language support
- [ ] Social features (leaderboards, sharing)
- [ ] Video content integration
- [ ] Spaced repetition algorithm
- [ ] Certificate generation
- [ ] Mobile apps (iOS/Android)
- [ ] Parent/teacher dashboard

## 💡 Implementation Highlights

- **Bulk File Operations** - Used for efficient multi-file creation
- **Modern React Patterns** - Hooks, context, and best practices
- **AI Integration** - Emergent LLM for universal AI access
- **Component Library** - Radix UI for accessibility
- **Chart Library** - Recharts for beautiful data visualization

## 📝 Notes

- All URLs use environment variables (no hardcoding)
- MongoDB uses UUIDs (not ObjectId) for JSON compatibility
- Backend runs on port 8001 with `/api` prefix
- Frontend uses React Router for navigation
- AI responses are parsed and validated
- Progressive enhancement approach

## 🎉 Ready to Deploy!

The LearnEye platform is fully functional and ready for deployment. All features are implemented, tested, and optimized for production use.

### Services Status
- ✅ MongoDB - Running on localhost:27017
- ✅ Backend - Running on 0.0.0.0:8001
- ✅ Frontend - Running on localhost:3000
- ✅ AI Integration - Connected via Emergent LLM Key

---

**Built with ❤️ for learners worldwide**

🌟 Star this project if you find it helpful!
📧 Questions? Open an issue or contribute!

**LearnEye** - *Making learning adaptive, intelligent, and fun!* 👁️✨
