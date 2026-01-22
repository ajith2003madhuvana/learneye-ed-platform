import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EyeLogo from '../components/EyeLogo';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { Sparkles, BookOpen, LogOut, BarChart3 } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const TopicSelection = ({ username, onCourseCreated, onLogout }) => {
  const [topic, setTopic] = useState('');
  const [skillLevel, setSkillLevel] = useState('Beginner');
  const [learningGoal, setLearningGoal] = useState('');
  const [generating, setGenerating] = useState(false);
  const navigate = useNavigate();

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error('Please enter a topic you want to learn');
      return;
    }

    setGenerating(true);
    toast.loading(`Creating your personalized ${topic} course...`, { id: 'course-gen' });

    try {
      const response = await axios.post(`${API}/course/generate`, {
        username,
        topic: topic.trim(),
        skill_level: skillLevel,
        learning_goal: learningGoal.trim() || null
      });

      onCourseCreated(response.data);
      toast.success(`Course created successfully! Let's start learning! 🎉`, { id: 'course-gen' });
      navigate('/learn');
    } catch (error) {
      console.error('Course generation error:', error);
      toast.error('Failed to generate course. Please try again.', { id: 'course-gen' });
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen p-6">
      {/* Header */}
      <div className="max-w-4xl mx-auto mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <EyeLogo size="small" animated={false} />
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Welcome back, {username}! 👋</h2>
              <p className="text-gray-600">Ready to start your learning journey?</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => navigate('/progress')}
              variant="outline"
              className="flex items-center gap-2"
              data-testid="view-progress-button"
            >
              <BarChart3 className="w-4 h-4" />
              Progress
            </Button>
            <Button
              onClick={onLogout}
              variant="outline"
              className="flex items-center gap-2"
              data-testid="logout-button"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-2xl mx-auto">
        <Card className="p-8 bg-white/80 backdrop-blur-sm shadow-xl border-2 border-indigo-100">
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2">
                <Sparkles className="w-6 h-6 text-indigo-600" />
                <h1 className="text-3xl font-bold text-gray-800">Create Your Course</h1>
              </div>
              <p className="text-gray-600">
                Tell us what you want to learn, and we'll create a personalized course just for you!
              </p>
            </div>

            <div className="space-y-4">
              {/* Topic Input */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  What do you want to learn?
                </label>
                <Input
                  type="text"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  placeholder="e.g., Python Basics, Web Development, Machine Learning"
                  className="text-lg p-6"
                  disabled={generating}
                  data-testid="topic-input"
                />
              </div>

              {/* Skill Level */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                  Your current skill level
                </label>
                <Select value={skillLevel} onValueChange={setSkillLevel} disabled={generating}>
                  <SelectTrigger className="text-lg p-6" data-testid="skill-level-select">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Beginner">Beginner - I'm just starting</SelectItem>
                    <SelectItem value="Intermediate">Intermediate - I have some experience</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Learning Goal (Optional) */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">
                  Learning goal (optional)
                </label>
                <Textarea
                  value={learningGoal}
                  onChange={(e) => setLearningGoal(e.target.value)}
                  placeholder="e.g., Build a personal website, Prepare for an interview, Start a new project"
                  className="min-h-[100px]"
                  disabled={generating}
                  data-testid="learning-goal-input"
                />
              </div>
            </div>

            <Button
              onClick={handleGenerate}
              disabled={!topic.trim() || generating}
              className="w-full py-6 text-lg font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
              data-testid="generate-course-button"
            >
              {generating ? (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating Your Course...
                </div>
              ) : (
                'Generate My Course ✨'
              )}
            </Button>

            <div className="text-center">
              <p className="text-sm text-gray-500">
                Our AI will create a personalized 5-module course tailored to your level
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TopicSelection;