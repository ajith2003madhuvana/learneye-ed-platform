import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import WelcomeScreen from './pages/WelcomeScreen';
import TopicSelection from './pages/TopicSelection';
import LearningModule from './pages/LearningModule';
import QuizScreen from './pages/QuizScreen';
import TeachingScreen from './pages/TeachingScreen';
import ProgressDashboard from './pages/ProgressDashboard';
import CompletionScreen from './pages/CompletionScreen';
import AITutor from './components/AITutor';
import { Toaster } from 'sonner';

function App() {
  const [username, setUsername] = useState(null);
  const [currentCourse, setCurrentCourse] = useState(null);
  const [showTutor, setShowTutor] = useState(false);

  useEffect(() => {
    // Load username from localStorage
    const savedUsername = localStorage.getItem('learneye_username');
    if (savedUsername) {
      setUsername(savedUsername);
    }

    // Load current course
    const savedCourse = localStorage.getItem('learneye_current_course');
    if (savedCourse) {
      try {
        setCurrentCourse(JSON.parse(savedCourse));
      } catch (e) {
        console.error('Failed to parse saved course', e);
      }
    }
  }, []);

  const handleSetUsername = (name) => {
    setUsername(name);
    localStorage.setItem('learneye_username', name);
  };

  const handleSetCourse = (course) => {
    setCurrentCourse(course);
    localStorage.setItem('learneye_current_course', JSON.stringify(course));
  };

  const handleLogout = () => {
    setUsername(null);
    setCurrentCourse(null);
    localStorage.removeItem('learneye_username');
    localStorage.removeItem('learneye_current_course');
  };

  return (
    <div className="App min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <BrowserRouter>
        <Routes>
          <Route 
            path="/" 
            element={
              username ? 
              <Navigate to="/topic" /> : 
              <WelcomeScreen onSetUsername={handleSetUsername} />
            } 
          />
          <Route 
            path="/topic" 
            element={
              username ? 
              <TopicSelection 
                username={username} 
                onCourseCreated={handleSetCourse}
                onLogout={handleLogout}
              /> : 
              <Navigate to="/" />
            } 
          />
          <Route 
            path="/learn" 
            element={
              username && currentCourse ? 
              <LearningModule 
                username={username} 
                course={currentCourse}
                onCourseUpdate={handleSetCourse}
              /> : 
              <Navigate to="/" />
            } 
          />
          <Route 
            path="/quiz" 
            element={
              username && currentCourse ? 
              <QuizScreen 
                username={username} 
                course={currentCourse}
                onCourseUpdate={handleSetCourse}
              /> : 
              <Navigate to="/" />
            } 
          />
          <Route 
            path="/teaching" 
            element={
              username && currentCourse ? 
              <TeachingScreen 
                username={username} 
                course={currentCourse}
                onCourseUpdate={handleSetCourse}
              /> : 
              <Navigate to="/" />
            } 
          />
          <Route 
            path="/progress" 
            element={
              username ? 
              <ProgressDashboard 
                username={username}
                onLogout={handleLogout}
              /> : 
              <Navigate to="/" />
            } 
          />
          <Route 
            path="/complete" 
            element={
              username ? 
              <CompletionScreen 
                username={username}
                course={currentCourse}
                onRestart={() => {
                  setCurrentCourse(null);
                  localStorage.removeItem('learneye_current_course');
                }}
              /> : 
              <Navigate to="/" />
            } 
          />
        </Routes>

        {/* AI Tutor - Floating Widget */}
        {username && currentCourse && (
          <AITutor 
            username={username}
            course={currentCourse}
            isOpen={showTutor}
            onToggle={() => setShowTutor(!showTutor)}
          />
        )}
      </BrowserRouter>
      
      <Toaster position="top-center" richColors />
    </div>
  );
}

export default App;