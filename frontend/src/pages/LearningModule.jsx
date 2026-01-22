import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EyeLogo from '../components/EyeLogo';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { BookOpen, CheckCircle2, ArrowRight, Lightbulb } from 'lucide-react';
import { Badge } from '../components/ui/badge';

const LearningModule = ({ username, course, onCourseUpdate }) => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(course.current_module_index || 0);
  const currentModule = course.modules[currentIndex];
  const totalModules = course.modules.length;
  const progressPercentage = ((currentIndex + 1) / totalModules) * 100;

  if (!currentModule) {
    navigate('/complete');
    return null;
  }

  const handleNext = () => {
    navigate('/quiz');
  };

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="max-w-5xl mx-auto mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <EyeLogo size="small" animated={false} />
            <div>
              <h2 className="text-xl font-bold text-gray-800">{course.topic}</h2>
              <p className="text-sm text-gray-600">Module {currentIndex + 1} of {totalModules}</p>
            </div>
          </div>
          <Badge variant="secondary" className="text-sm">
            {course.skill_level}
          </Badge>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Course Progress</span>
            <span>{Math.round(progressPercentage)}% Complete</span>
          </div>
          <Progress value={progressPercentage} className="h-3" data-testid="course-progress-bar" />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto">
        <Card className="p-8 bg-white/80 backdrop-blur-sm shadow-xl border-2 border-indigo-100">
          <div className="space-y-6">
            {/* Module Title */}
            <div className="flex items-start gap-3">
              <BookOpen className="w-8 h-8 text-indigo-600 flex-shrink-0 mt-1" />
              <div>
                <h1 className="text-3xl font-bold text-gray-800" data-testid="module-title">
                  {currentModule.title}
                </h1>
                <p className="text-gray-600 mt-2">
                  Hi {username}, let's dive into this concept together! 🚀
                </p>
              </div>
            </div>

            {/* Module Content */}
            <div className="prose max-w-none">
              <div className="text-gray-700 leading-relaxed space-y-4" data-testid="module-content">
                {currentModule.content.split('\n\n').map((paragraph, idx) => (
                  <p key={idx} className="text-lg">{paragraph}</p>
                ))}
              </div>
            </div>

            {/* Examples Section */}
            {currentModule.examples && currentModule.examples.length > 0 && (
              <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl border-2 border-indigo-100">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-500" />
                  Examples
                </h3>
                <div className="space-y-3">
                  {currentModule.examples.map((example, idx) => (
                    <div key={idx} className="bg-white p-4 rounded-lg border border-indigo-200" data-testid={`example-${idx}`}>
                      <p className="text-gray-700">{example}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Key Points */}
            {currentModule.key_points && currentModule.key_points.length > 0 && (
              <div className="bg-green-50 p-6 rounded-xl border-2 border-green-200">
                <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  Key Takeaways
                </h3>
                <ul className="space-y-2">
                  {currentModule.key_points.map((point, idx) => (
                    <li key={idx} className="flex items-start gap-2" data-testid={`key-point-${idx}`}>
                      <span className="text-green-600 font-bold mt-1">•</span>
                      <span className="text-gray-700">{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Next Button */}
            <div className="pt-4">
              <Button
                onClick={handleNext}
                className="w-full py-6 text-lg font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                data-testid="proceed-to-quiz-button"
              >
                <span className="flex items-center gap-2">
                  Ready for Quiz 🧠
                  <ArrowRight className="w-5 h-5" />
                </span>
              </Button>
              <p className="text-center text-sm text-gray-500 mt-3">
                Great job learning, {username}! Let's test your understanding.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default LearningModule;