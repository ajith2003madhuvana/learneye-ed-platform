import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ScrollArea } from './ui/scroll-area';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AITutor = ({ username, course, isOpen, onToggle }) => {
  const [messages, setMessages] = useState([
    {
      role: 'tutor',
      content: `Hi ${username}! 👋 I'm your AI learning assistant. Ask me anything about what you're learning!`,
      encouragement: ''
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const currentModule = course.modules[course.current_module_index || 0];
      const response = await axios.post(`${API}/tutor/ask`, {
        username,
        course_id: course.id,
        module_id: currentModule?.id,
        message: userMessage,
        context: 'learning'
      });

      setMessages(prev => [
        ...prev,
        {
          role: 'tutor',
          content: response.data.response,
          encouragement: response.data.encouragement
        }
      ]);
    } catch (error) {
      console.error('Tutor error:', error);
      setMessages(prev => [
        ...prev,
        {
          role: 'tutor',
          content: `Sorry ${username}, I had trouble processing that. Can you try asking again?`,
          encouragement: ''
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={onToggle}
          className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform z-50 group"
          data-testid="ai-tutor-toggle-button"
        >
          <MessageCircle className="w-8 h-8 text-white group-hover:animate-bounce" />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full animate-pulse" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div 
          className="fixed bottom-6 right-6 w-96 h-[32rem] bg-white rounded-2xl shadow-2xl flex flex-col z-50 border-2 border-indigo-200"
          data-testid="ai-tutor-chat-window"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-yellow-300 animate-pulse" />
              <h3 className="text-white font-semibold">AI Learning Assistant</h3>
            </div>
            <button
              onClick={onToggle}
              className="text-white hover:bg-white/20 p-1 rounded-full transition-colors"
              data-testid="ai-tutor-close-button"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-3 rounded-2xl ${
                      msg.role === 'user'
                        ? 'bg-indigo-600 text-white rounded-br-none'
                        : 'bg-gray-100 text-gray-800 rounded-bl-none'
                    }`}
                  >
                    <p className="text-sm">{msg.content}</p>
                    {msg.encouragement && (
                      <p className="text-xs mt-2 opacity-80 italic">{msg.encouragement}</p>
                    )}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 p-3 rounded-2xl rounded-bl-none">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything..."
                className="flex-1"
                disabled={loading}
                data-testid="ai-tutor-input"
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="bg-gradient-to-r from-indigo-600 to-purple-600"
                data-testid="ai-tutor-send-button"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AITutor;