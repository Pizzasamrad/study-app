import React from 'react';
import { Brain, Target, Clock, BarChart3, Edit3, Home, Palette } from 'lucide-react';

const Navigation = ({ activeTab, onTabChange }) => {
  const tabs = [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      icon: Home, 
      color: 'from-orange-500 to-red-500', 
      bgColor: 'from-orange-500/10 to-red-500/10',
      emoji: '🏠',
      description: 'Overview & Quick Actions'
    },
    { 
      id: 'flashcards', 
      label: 'Flashcards', 
      icon: Brain, 
      color: 'from-purple-500 to-indigo-500', 
      bgColor: 'from-purple-500/10 to-indigo-500/10',
      emoji: '🧠',
      description: 'Create & Review Cards'
    },
    { 
      id: 'study', 
      label: 'Study', 
      icon: Target, 
      color: 'from-indigo-500 to-purple-500', 
      bgColor: 'from-indigo-500/10 to-purple-500/10',
      emoji: '🎯',
      description: 'Advanced Study Modes'
    },
    { 
      id: 'pomodoro', 
      label: 'Pomodoro', 
      icon: Clock, 
      color: 'from-green-500 to-teal-500', 
      bgColor: 'from-green-500/10 to-teal-500/10',
      emoji: '⏰',
      description: 'Focus Timer'
    },
    { 
      id: 'analytics', 
      label: 'Analytics', 
      icon: BarChart3, 
      color: 'from-blue-500 to-cyan-500', 
      bgColor: 'from-blue-500/10 to-cyan-500/10',
      emoji: '📊',
      description: 'Progress & Insights'
    },
    { 
      id: 'customization', 
      label: 'Customize', 
      icon: Palette, 
      color: 'from-pink-500 to-purple-500', 
      bgColor: 'from-pink-500/10 to-purple-500/10',
      emoji: '🎨',
      description: 'Unlock & Personalize'
    },
    { 
      id: 'blurts', 
      label: 'Brain Blurts', 
      icon: Edit3, 
      color: 'from-yellow-500 to-orange-500', 
      bgColor: 'from-yellow-500/10 to-orange-500/10',
      emoji: '💡',
      description: 'Quick Notes & Ideas'
    }
  ];

  const handleTabClick = (e, tabId) => {
    e.preventDefault();
    e.stopPropagation();
    onTabChange(tabId);
  };

  return (
    <nav className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl mx-6 mb-8 shadow-2xl">
      <div className="p-2">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-2">
          {tabs.map(({ id, label, icon: Icon, color, bgColor, emoji, description }) => (
            <button
              key={id}
              onClick={(e) => handleTabClick(e, id)}
              className={`group relative p-4 rounded-xl transition-all duration-300 font-medium text-left min-h-[120px] w-full ${
                activeTab === id 
                  ? `bg-gradient-to-r ${color} text-white shadow-2xl transform scale-105` 
                  : `bg-gradient-to-r ${bgColor} text-white/80 hover:text-white hover:scale-105 hover:shadow-xl`
              }`}
              style={{ touchAction: 'manipulation' }}
            >
              {/* Active indicator */}
              {activeTab === id && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-white rounded-full shadow-lg animate-pulse"></div>
              )}
              
              {/* Icon */}
              <div className="flex items-center space-x-3 mb-2">
                <div className={`p-2 rounded-lg ${
                  activeTab === id 
                    ? 'bg-white/20' 
                    : 'bg-white/10 group-hover:bg-white/20'
                }`}>
                  <Icon size={20} />
                </div>
                <span className="text-lg">{emoji}</span>
              </div>
              
              {/* Label */}
              <div className="font-bold text-sm">{label}</div>
              
              {/* Description */}
              <div className={`text-xs mt-1 ${
                activeTab === id 
                  ? 'text-white/90' 
                  : 'text-white/60 group-hover:text-white/80'
              }`}>
                {description}
              </div>
              
              {/* Hover effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 rounded-xl pointer-events-none"></div>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
