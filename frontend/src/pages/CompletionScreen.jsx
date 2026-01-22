import React from 'react';
import { useNavigate } from 'react-router-dom';
import EyeLogo from '../components/EyeLogo';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Trophy, Sparkles, TrendingUp, BookOpen } from 'lucide-react';

const CompletionScreen = ({ username, course, onRestart }) => {
  const navigate = useNavigate();

  const handleNewCourse = () => {
    onRestart();
    navigate('/topic');
  };

  const handleViewProgress = () => {
    navigate('/progress');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="max-w-2xl w-full p-12 bg-white/90 backdrop-blur-sm shadow-2xl border-2 border-indigo-100 text-center space-y-8">
        {/* Animated Logo */}
        <div className="relative">
          <EyeLogo size="xlarge" animated />
          <div className="absolute -top-4 -right-4">
            <Trophy className="w-16 h-16 text-yellow-500 animate-bounce" />
          </div>
        </div>

        {/* Congratulations Message */}
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-2">
            <Sparkles className="w-8 h-8 text-yellow-500 animate-pulse" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              Congratulations, {username}! 🎉
            </h1>
            <Sparkles className="w-8 h-8 text-yellow-500 animate-pulse" />
          </div>
          
          <p className="text-xl text-gray-700" data-testid="completion-message">
            You stayed consistent and completed the <span className="font-semibold">{course?.topic || 'course'}</span>!
          </p>
          
          <p className="text-lg text-gray-600">
            Keep learning and growing! Your dedication is inspiring. 🚀
          </p>
        </div>

        {/* Achievement Stats */}
        <div className="grid grid-cols-3 gap-4 py-6">
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-xl border-2 border-indigo-200">
            <BookOpen className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-800">{course?.modules?.length || 5}</p>
            <p className="text-sm text-gray-600">Modules</p>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-teal-50 p-6 rounded-xl border-2 border-green-200">
            <TrendingUp className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-800">100%</p>
            <p className="text-sm text-gray-600">Complete</p>
          </div>
          
          <div className="bg-gradient-to-br from-yellow-50 to-amber-50 p-6 rounded-xl border-2 border-yellow-200">
            <Trophy className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-800">+1</p>
            <p className="text-sm text-gray-600">Badge Earned</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4 pt-4">
          <Button
            onClick={handleNewCourse}
            className="w-full py-6 text-lg font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            data-testid="start-new-course-button"
          >
            Start New Course ✨
          </Button>
          
          <Button
            onClick={handleViewProgress}
            variant="outline"
            className="w-full py-6 text-lg font-semibold"
            data-testid="view-progress-button"
          >
            View My Progress 📊
          </Button>
        </div>

        {/* Motivational Quote */}
        <div className="pt-6 border-t border-gray-200">
          <p className="text-gray-600 italic">
            "Learning is a journey, not a destination. Keep exploring, {username}!" 🌟
          </p>
        </div>
      </Card>
    </div>
  );
};

export default CompletionScreen;
