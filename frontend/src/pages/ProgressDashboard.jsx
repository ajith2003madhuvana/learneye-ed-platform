import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import EyeLogo from '../components/EyeLogo';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Trophy, TrendingUp, BookOpen, Star, Award, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ProgressDashboard = ({ username, onLogout }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    loadProgress();
  }, []);

  const loadProgress = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/progress/${username}`);
      setData(response.data);
    } catch (error) {
      console.error('Failed to load progress:', error);
      toast.error('Failed to load progress data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <EyeLogo size="large" animated />
          <p className="mt-4 text-lg text-gray-600">Loading your progress...</p>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const learningPathData = data?.courses?.flatMap(course => 
    course.modules.map((module, idx) => ({
      name: `${course.topic.substring(0, 10)}... M${idx + 1}`,
      module: idx + 1,
      course: course.topic
    }))
  ) || [];

  const performanceData = data?.progress?.map((p, idx) => ({
    attempt: idx + 1,
    score: p.quiz_score || 0,
    percentage: p.quiz_total ? Math.round((p.quiz_score / p.quiz_total) * 100) : 0,
    date: new Date(p.timestamp).toLocaleDateString()
  })) || [];

  const user = data?.user || {};
  const totalCourses = user.total_courses || 0;
  const totalModules = user.total_modules_completed || 0;
  const currentStreak = user.current_streak || 0;
  const level = user.level || 1;
  const badges = user.badges || [];

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <EyeLogo size="medium" animated={false} />
              <div>
                <h1 className="text-3xl font-bold text-gray-800">{username}'s Learning Journey 🚀</h1>
                <p className="text-gray-600">Track your progress and celebrate your achievements!</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => navigate('/topic')} variant="outline" data-testid="back-to-courses-button">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Courses
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="p-6 bg-gradient-to-br from-indigo-500 to-purple-500 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Total Courses</p>
                  <p className="text-3xl font-bold" data-testid="total-courses">{totalCourses}</p>
                </div>
                <BookOpen className="w-12 h-12 opacity-50" />
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-green-500 to-teal-500 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Modules Completed</p>
                  <p className="text-3xl font-bold" data-testid="total-modules">{totalModules}</p>
                </div>
                <Trophy className="w-12 h-12 opacity-50" />
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-orange-500 to-red-500 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Current Streak</p>
                  <p className="text-3xl font-bold" data-testid="current-streak">{currentStreak} days</p>
                </div>
                <TrendingUp className="w-12 h-12 opacity-50" />
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-yellow-500 to-amber-500 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm opacity-90">Level</p>
                  <p className="text-3xl font-bold" data-testid="user-level">{level}</p>
                </div>
                <Star className="w-12 h-12 opacity-50" />
              </div>
            </Card>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="graphs" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="graphs" data-testid="graphs-tab">Learning Graphs 📊</TabsTrigger>
            <TabsTrigger value="badges" data-testid="badges-tab">Badges & Achievements 🏆</TabsTrigger>
            <TabsTrigger value="courses" data-testid="courses-tab">Course History 📖</TabsTrigger>
          </TabsList>

          {/* Graphs Tab */}
          <TabsContent value="graphs" className="space-y-6">
            {/* Learning Path Graph */}
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <BookOpen className="w-6 h-6 text-indigo-600" />
                Learning Path Progress
              </h2>
              <p className="text-gray-600 mb-6">Your journey through different modules across all courses</p>
              {learningPathData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={learningPathData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="module" stroke="#6366f1" fill="#818cf8" name="Module Progress" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p>Start your first course to see your learning path!</p>
                </div>
              )}
            </Card>

            {/* Performance Graph */}
            <Card className="p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-green-600" />
                Quiz Performance Over Time
              </h2>
              <p className="text-gray-600 mb-6">Track how your understanding improves with each quiz</p>
              {performanceData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="attempt" label={{ value: 'Quiz Attempts', position: 'insideBottom', offset: -5 }} />
                    <YAxis label={{ value: 'Score %', angle: -90, position: 'insideLeft' }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="percentage" stroke="#10b981" strokeWidth={3} name="Score %" />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <TrendingUp className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p>Complete quizzes to track your performance!</p>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Badges Tab */}
          <TabsContent value="badges">
            <Card className="p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <Award className="w-6 h-6 text-yellow-600" />
                Your Achievements
              </h2>
              {badges.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {badges.map((badge, idx) => (
                    <div
                      key={idx}
                      className="p-6 bg-gradient-to-br from-yellow-50 to-amber-50 border-2 border-yellow-300 rounded-xl flex items-center gap-4"
                      data-testid={`badge-${idx}`}
                    >
                      <Trophy className="w-12 h-12 text-yellow-600" />
                      <div>
                        <p className="font-semibold text-gray-800">{badge}</p>
                        <Badge variant="secondary" className="mt-2">Achievement Unlocked</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <Award className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p>Complete courses to earn badges!</p>
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Courses Tab */}
          <TabsContent value="courses">
            <Card className="p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Course History</h2>
              {data?.courses && data.courses.length > 0 ? (
                <div className="space-y-4">
                  {data.courses.map((course, idx) => (
                    <div
                      key={idx}
                      className="p-6 bg-gradient-to-r from-indigo-50 to-purple-50 border-2 border-indigo-200 rounded-xl"
                      data-testid={`course-${idx}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-800">{course.topic}</h3>
                          <p className="text-gray-600 mt-1">{course.modules.length} modules</p>
                          <div className="flex gap-2 mt-3">
                            <Badge variant="secondary">{course.skill_level}</Badge>
                            {course.completed && <Badge className="bg-green-500">Completed</Badge>}
                          </div>
                        </div>
                        <div className="text-right text-sm text-gray-500">
                          {new Date(course.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <BookOpen className="w-16 h-16 mx-auto mb-4 opacity-30" />
                  <p>No courses yet. Start learning now!</p>
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ProgressDashboard;