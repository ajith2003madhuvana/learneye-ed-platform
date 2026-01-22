import React from 'react';
import { Eye } from 'lucide-react';

const EyeLogo = ({ size = 'large', animated = true }) => {
  const sizes = {
    small: 'w-12 h-12',
    medium: 'w-20 h-20',
    large: 'w-32 h-32',
    xlarge: 'w-40 h-40'
  };

  return (
    <div className={`relative ${sizes[size]} mx-auto`}>
      {/* Outer Glow */}
      <div 
        className={`absolute inset-0 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-full blur-2xl opacity-30 ${
          animated ? 'animate-pulse' : ''
        }`}
      />
      
      {/* Main Eye Container */}
      <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full shadow-2xl">
        {/* Inner Eye Icon */}
        <Eye 
          className={`w-2/3 h-2/3 text-white ${
            animated ? 'animate-bounce' : ''
          }`} 
          strokeWidth={2}
        />
        
        {/* Sparkle Effects */}
        <div className="absolute top-2 right-2 w-2 h-2 bg-white rounded-full animate-ping" />
        <div className="absolute bottom-3 left-3 w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
      </div>
      
      {/* Rotating Ring */}
      {animated && (
        <div className="absolute inset-0 border-4 border-indigo-300 rounded-full animate-spin-slow opacity-40" />
      )}
    </div>
  );
};

export default EyeLogo;