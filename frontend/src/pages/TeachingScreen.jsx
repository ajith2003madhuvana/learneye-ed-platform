import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Textarea } from '../components/ui/textarea';
import { MessageSquare, ArrowRight, Sparkles } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const TeachingScreen = ({ username, course, onCourseUpdate }) => {
  const navigate = useNavigate();
  const [explanation, setExplanation] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const currentIndex = course.current_module_index || 0;
  const currentModule = course.modules[currentIndex];

  const handleSubmit = async () => {
    if (!explanation.trim()) {
      toast.error('Please write your explanation');
      return;
    }

    setSubmitting(true);
    try {
      const response = await axios.post(`${API}/teaching/submit`, {
        username,
        course_id: course.id,
        module_id: currentModule.id,
        explanation: explanation.trim()
      });

      setFeedback(response.data);
      toast.success('Great explanation! Here\'s your feedback.');
    } catch (error) {
      console.error('Teaching submission error:', error);
      toast.error('Failed to evaluate explanation. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = async () => {
    const nextIndex = currentIndex + 1;
    
    if (nextIndex < course.modules.length) {
      // Move to next module
      try {
        await axios.put(`${API}/course/${course.id}/module?module_index=${nextIndex}`);
        const updatedCourse = { ...course, current_module_index: nextIndex };
        onCourseUpdate(updatedCourse);
        navigate('/learn');
        toast.success(`Moving to Module ${nextIndex + 1}! 🚀`);
      } catch (error) {
        console.error('Failed to update module:', error);
        toast.error('Failed to proceed. Please try again.');
      }
    } else {
      // Course completed
      try {
        await axios.put(`${API}/course/${course.id}/complete`);
        navigate('/complete');
      } catch (error) {
        console.error('Failed to complete course:', error);
        navigate('/complete');
      }
    }
  };

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Teaching Phase 🎯</h1>
          <p className="text-gray-600">
            {feedback
              ? `Awesome job, ${username}! Here's your feedback.`
              : `Great work on the quiz, ${username}! Now, teach me what you learned.`}
          </p>
        </div>

        {!feedback ? (
          <Card className="p-8 bg-white/80 backdrop-blur-sm shadow-xl border-2 border-indigo-100">
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl border-2 border-indigo-100">
                <h3 className="text-xl font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-indigo-600" />
                  Explain: {currentModule.title}
                </h3>
                <p className="text-gray-700">
                  In your own words, explain what you learned from this module. Teaching is one of the best ways to solidify your understanding!
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                  Your Explanation
                </label>
                <Textarea
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  placeholder={`Hi there! Let me explain ${currentModule.title}...\n\nStart by describing the main concepts you learned, then add examples or how you'd use this knowledge.`}
                  className="min-h-[250px] text-base"
                  disabled={submitting}
                  data-testid="teaching-explanation-input"
                />
                <p className="text-sm text-gray-500">
                  Tip: Pretend you're teaching a friend. Use simple language and examples!
                </p>
              </div>

              <Button
                onClick={handleSubmit}
                disabled={!explanation.trim() || submitting}
                className="w-full py-6 text-lg font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                data-testid="submit-teaching-button"
              >
                {submitting ? 'Evaluating...' : 'Submit My Explanation ✨'}
              </Button>
            </div>
          </Card>
        ) : (
          /* Feedback */
          <div className="space-y-6">
            <Card className="p-8 bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-300">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-yellow-500" />
                  <h2 className="text-2xl font-bold text-gray-800">AI Feedback</h2>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200">
                  <p className="text-gray-700 text-lg" data-testid="teaching-feedback">{feedback.feedback}</p>
                </div>

                <div className="bg-white p-6 rounded-xl border border-gray-200">
                  <h3 className="font-semibold text-gray-800 mb-3">Quality Score</h3>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 h-4 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-green-500 to-blue-500 h-full transition-all duration-500"
                        style={{ width: `${feedback.quality_score * 10}%` }}
                        data-testid="quality-score-bar"
                      />
                    </div>
                    <span className="text-2xl font-bold text-gray-800" data-testid="quality-score">
                      {feedback.quality_score}/10
                    </span>
                  </div>
                </div>

                {feedback.suggestions && feedback.suggestions.length > 0 && (
                  <div className="bg-white p-6 rounded-xl border border-gray-200">
                    <h3 className="font-semibold text-gray-800 mb-3">Suggestions for Improvement</h3>
                    <ul className="space-y-2">
                      {feedback.suggestions.map((suggestion, idx) => (
                        <li key={idx} className="flex items-start gap-2" data-testid={`suggestion-${idx}`}>
                          <span className="text-indigo-600 font-bold mt-1">•</span>
                          <span className="text-gray-700">{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </Card>

            <Button
              onClick={handleNext}
              className="w-full py-6 text-lg font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              data-testid="proceed-next-button"
            >
              {currentIndex + 1 < course.modules.length ? 'Next Module' : 'Complete Course'}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeachingScreen;