import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import EyeLogo from '../components/EyeLogo';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card } from '../components/ui/card';
import axios from 'axios';
import { toast } from 'sonner';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const WelcomeScreen = ({ onSetUsername }) => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleStart = async () => {
    if (!name.trim()) {
      toast.error('Please enter your name');
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${API}/user/register?username=${encodeURIComponent(name.trim())}`);
      onSetUsername(name.trim());
      toast.success(`Welcome, ${name.trim()}! 🎉`);
      navigate('/topic');
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <Card className="max-w-md w-full p-8 space-y-8 bg-white/80 backdrop-blur-sm shadow-2xl border-2 border-indigo-100">
        <div className="space-y-4">
          <EyeLogo size="xlarge" animated />
          
          <div className="text-center space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              LearnEye
            </h1>
            <p className="text-gray-600 text-lg">
              Your Adaptive AI Learning Platform
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              What should we call you?
            </label>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleStart()}
              placeholder="Enter your name (e.g., Alex)"
              className="text-lg p-6"
              disabled={loading}
              data-testid="username-input"
            />
          </div>

          <Button
            onClick={handleStart}
            disabled={!name.trim() || loading}
            className="w-full py-6 text-lg font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            data-testid="start-learning-button"
          >
            {loading ? 'Starting...' : "Let's Start Learning 🚀"}
          </Button>
        </div>

        <div className="text-center space-y-2 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            ✨ AI-powered personalized courses
          </p>
          <p className="text-sm text-gray-500">
            🎯 Adaptive learning that fits your pace
          </p>
          <p className="text-sm text-gray-500">
            💪 Interactive quizzes and real-time feedback
          </p>
        </div>
      </Card>
    </div>
  );
};

export default WelcomeScreen;