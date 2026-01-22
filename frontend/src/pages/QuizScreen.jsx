import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EyeLogo from '../components/EyeLogo';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import { Label } from '../components/ui/label';
import { CheckCircle2, XCircle, RefreshCw, ArrowRight } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const QuizScreen = ({ username, course, onCourseUpdate }) => {
  const navigate = useNavigate();
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const currentIndex = course.current_module_index || 0;
  const currentModule = course.modules[currentIndex];

  useEffect(() => {
    loadQuiz();
  }, []);

  const loadQuiz = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`${API}/quiz/generate`, null, {
        params: {
          course_id: course.id,
          module_id: currentModule.id
        }
      });
      setQuiz(response.data);
    } catch (error) {
      console.error('Quiz loading error:', error);
      toast.error('Failed to load quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < quiz.questions.length) {
      toast.error('Please answer all questions before submitting');
      return;
    }

    setSubmitting(true);
    try {
      const answerArray = quiz.questions.map((q, idx) => answers[idx] || 0);
      const response = await axios.post(`${API}/quiz/submit`, {
        username,
        course_id: course.id,
        module_id: currentModule.id,
        answers: answerArray
      });

      setResult(response.data);
      setSubmitted(true);

      if (response.data.passed) {
        toast.success(response.data.feedback);
      } else {
        toast.error(response.data.feedback);
      }
    } catch (error) {
      console.error('Quiz submission error:', error);
      toast.error('Failed to submit quiz. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = () => {
    if (result.passed) {
      // Move to teaching phase
      navigate('/teaching');
    } else {
      // Simplify module and go back to learning
      toast.loading('Creating a simpler explanation...');
      navigate('/learn');
    }
  };

  const handleRetry = () => {
    setAnswers({});
    setSubmitted(false);
    setResult(null);
    loadQuiz();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <EyeLogo size="large" animated />
          <p className="mt-4 text-lg text-gray-600">Preparing your quiz...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Quiz Time! 🧠</h1>
          <p className="text-gray-600">
            {submitted
              ? result.passed
                ? `Excellent work, ${username}! You've shown great understanding! 🎉`
                : `No worries, ${username}! Let's review and try again. 💪`
              : `Let's see how well you understood the concept, ${username}!`}
          </p>
        </div>

        {/* Quiz Questions */}
        {!submitted ? (
          <Card className="p-8 bg-white/80 backdrop-blur-sm shadow-xl border-2 border-indigo-100">
            <div className="space-y-8">
              {quiz.questions.map((question, qIdx) => (
                <div key={qIdx} className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800" data-testid={`question-${qIdx}`}>
                    {qIdx + 1}. {question.question}
                  </h3>
                  <RadioGroup
                    value={answers[qIdx]?.toString()}
                    onValueChange={(value) => setAnswers({ ...answers, [qIdx]: parseInt(value) })}
                  >
                    {question.options.map((option, optIdx) => (
                      <div key={optIdx} className="flex items-center space-x-2">
                        <RadioGroupItem value={optIdx.toString()} id={`q${qIdx}-opt${optIdx}`} data-testid={`question-${qIdx}-option-${optIdx}`} />
                        <Label htmlFor={`q${qIdx}-opt${optIdx}`} className="cursor-pointer text-gray-700">
                          {option}
                        </Label>
                      </div>
                    ))}
                  </RadioGroup>
                </div>
              ))}

              <Button
                onClick={handleSubmit}
                disabled={Object.keys(answers).length < quiz.questions.length || submitting}
                className="w-full py-6 text-lg font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                data-testid="submit-quiz-button"
              >
                {submitting ? 'Evaluating...' : 'Submit Answers ✅'}
              </Button>
            </div>
          </Card>
        ) : (
          /* Results */
          <div className="space-y-6">
            <Card className={`p-8 ${result.passed ? 'bg-green-50 border-green-300' : 'bg-yellow-50 border-yellow-300'} border-2`}>
              <div className="text-center space-y-4">
                {result.passed ? (
                  <CheckCircle2 className="w-20 h-20 text-green-600 mx-auto" />
                ) : (
                  <XCircle className="w-20 h-20 text-yellow-600 mx-auto" />
                )}
                <h2 className="text-3xl font-bold text-gray-800" data-testid="quiz-result-title">
                  {result.passed ? 'Well Done!' : 'Keep Learning!'}
                </h2>
                <p className="text-xl text-gray-700" data-testid="quiz-score">
                  Your Score: {result.score}/{result.total} ({result.percentage.toFixed(0)}%)
                </p>
                <p className="text-gray-700" data-testid="quiz-feedback">{result.feedback}</p>
              </div>
            </Card>

            <div className="flex gap-4">
              {!result.passed && (
                <Button
                  onClick={handleRetry}
                  variant="outline"
                  className="flex-1 py-6 text-lg font-semibold"
                  data-testid="retry-quiz-button"
                >
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Try Again
                </Button>
              )}
              <Button
                onClick={handleNext}
                className="flex-1 py-6 text-lg font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                data-testid="next-step-button"
              >
                {result.passed ? 'Continue to Teaching Phase' : 'Review Lesson'}
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuizScreen;