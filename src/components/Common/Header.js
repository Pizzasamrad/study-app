import React from 'react';
import { 
  Flame, Trophy, HardDrive, Cloud, Bell, Settings, User, LogOut 
} from 'lucide-react';
import { getLevelStats, LEVEL_CONFIG } from '../../services/levelService';

const Header = ({ 
  streakData, 
  storageMode, 
  onStorageModeChange, 
  onAuthModalOpen, 
  onLogout, 
  user,
  studyLogs,
  flashcards,
  blurts,
  selectedCustomizations,
  devLevel = 1
}) => {
  // Use dev level for testing, fallback to calculated level
  const levelData = {
    level: devLevel,
    levelTitle: LEVEL_CONFIG.LEVEL_TITLES[devLevel] || { title: "Novice Learner", description: "Just getting started" },
    totalXP: LEVEL_CONFIG.XP_PER_LEVEL[devLevel] || 0,
    progress: 0
  };

  return (
    <header className="bg-gradient-to-r from-purple-900/50 to-indigo-900/50 backdrop-blur-xl border-b border-white/10 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Side - Logo */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-purple-500/25">
                <span className="text-2xl font-black text-white">
                  {selectedCustomizations?.avatars === 'default' ? '🧠' : 
                   selectedCustomizations?.avatars === 'level2' ? '🐱' :
                   selectedCustomizations?.avatars === 'level3' ? '🦉' :
                   selectedCustomizations?.avatars === 'level5' ? '🐉' :
                   selectedCustomizations?.avatars === 'level7' ? '🦅' :
                   selectedCustomizations?.avatars === 'level10' ? '🌌' :
                   selectedCustomizations?.avatars === 'level15' ? '👑' :
                   selectedCustomizations?.avatars === 'streak7' ? '🔥' :
                   selectedCustomizations?.avatars === 'streak30' ? '⚡' :
                   selectedCustomizations?.avatars === 'cards50' ? '📝' :
                   selectedCustomizations?.avatars === 'cards200' ? '🎯' : '🧠'}
                </span>
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-2xl font-black bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                StudyMaster Pro
              </h1>
              <p className="text-xs text-white/60 font-medium">Advanced Learning Platform</p>
            </div>
          </div>

          {/* Center Stats */}
          <div className="hidden lg:flex items-center space-x-6">
            {streakData && streakData.current > 0 && (
              <div className="flex items-center space-x-2 bg-gradient-to-r from-orange-500/20 to-red-500/20 px-4 py-2 rounded-xl border border-orange-500/30">
                <Flame className="w-4 h-4 text-orange-400" />
                <span className="text-sm font-bold text-white">{streakData.current} day streak</span>
              </div>
            )}
            <div className="flex items-center space-x-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 px-4 py-2 rounded-xl border border-blue-500/30">
              <Trophy className="w-4 h-4 text-blue-400" />
              <div className="text-left">
                <div className="text-sm font-bold text-white">Level {levelData.level}</div>
                <div className="text-xs text-blue-200">{levelData.levelTitle.title}</div>
              </div>
            </div>
            <div className="flex items-center space-x-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 px-4 py-2 rounded-xl border border-green-500/30">
              <div className="w-4 h-4 text-green-400">⭐</div>
              <div className="text-left">
                <div className="text-sm font-bold text-white">{levelData.totalXP} XP</div>
                <div className="text-xs text-green-200">{levelData.progress}% to next</div>
              </div>
            </div>
          </div>

          {/* Right Side Controls */}
          <div className="flex items-center space-x-3">
            {/* Storage Mode Toggle */}
            <div className="flex items-center bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-1">
              <button
                onClick={() => onStorageModeChange('local')}
                className={`p-2 rounded-lg transition-all duration-300 ${
                  storageMode === 'local' 
                    ? 'bg-white/20 text-white shadow-lg' 
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
                title="Local Storage"
              >
                <HardDrive size={16} />
              </button>
              <button
                onClick={() => onStorageModeChange('cloud')}
                className={`p-2 rounded-lg transition-all duration-300 ${
                  storageMode === 'cloud' 
                    ? 'bg-white/20 text-white shadow-lg' 
                    : 'text-white/60 hover:text-white hover:bg-white/10'
                }`}
                title="Cloud Storage"
              >
                <Cloud size={16} />
              </button>
            </div>

            {/* Notifications */}
            <button className="p-2 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 text-white/80 hover:text-white hover:bg-white/10 transition-all duration-300">
              <Bell size={18} />
            </button>

            {/* Settings */}
            <button className="p-2 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 text-white/80 hover:text-white hover:bg-white/10 transition-all duration-300">
              <Settings size={18} />
            </button>

            {/* User Authentication */}
            {!user ? (
              <button
                onClick={onAuthModalOpen}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 font-bold shadow-lg hover:shadow-purple-500/25 transform hover:-translate-y-0.5 hover:scale-105 flex items-center space-x-2"
              >
                <User size={16} />
                <span>Sign In</span>
              </button>
            ) : (
              <div className="flex items-center space-x-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-white">{user.email}</p>
                  <p className="text-xs text-white/60">Signed in</p>
                </div>
                <button
                  onClick={onLogout}
                  className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-3 py-2 rounded-xl hover:from-red-600 hover:to-pink-600 transition-all duration-300 font-bold shadow-lg hover:shadow-red-500/25 transform hover:-translate-y-0.5 hover:scale-105 flex items-center space-x-2"
                >
                  <LogOut size={16} />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
