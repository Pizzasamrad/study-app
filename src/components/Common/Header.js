import React, { useState } from 'react';
import { 
  Flame, Trophy, HardDrive, Cloud, Settings, User, LogOut 
} from 'lucide-react';
import { LEVEL_CONFIG } from '../../services/levelService';
import { updateUserProfile } from '../../services/firebaseService';
import SettingsModal from '../Auth/SettingsModal';

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
  devLevel = 1,
  achievements = [],
  onCustomizationChange
}) => {
  const [showSettings, setShowSettings] = useState(false);
  
  // Use dev level for testing, fallback to calculated level
  const levelData = {
    level: devLevel,
    levelTitle: LEVEL_CONFIG.LEVEL_TITLES[devLevel] || { title: "Novice Learner", description: "Just getting started" },
    totalXP: LEVEL_CONFIG.XP_PER_LEVEL[devLevel] || 0,
    progress: 0
  };

  const handleUpdateProfile = async (profileData) => {
    try {
      await updateUserProfile(profileData);
      console.log('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const getUserAvatar = () => {
    const avatarMap = {
      'default': '🧠',
      'level2': '🐱',
      'level3': '🦉',
      'level5': '🐉',
      'level7': '🦅',
      'level10': '🌌',
      'level15': '👑',
      'streak7': '🔥',
      'streak30': '⚡',
      'cards50': '📝',
      'cards200': '🎯'
    };
    return avatarMap[user?.avatar || selectedCustomizations?.avatars || 'default'] || '🧠';
  };

  return (
    <>
    <header className="bg-gradient-to-r from-slate-900/90 to-black/90 backdrop-blur-xl border-b border-amber-500/30 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Side - Logo */}
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-600 to-orange-700 rounded-lg flex items-center justify-center shadow-2xl shadow-amber-500/25 border-2 border-amber-400/50">
                <span className="text-2xl font-black text-white">
                  {getUserAvatar()}
                </span>
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-2xl font-black text-amber-400 font-mono tracking-wider">
                DUNGEON_MASTER
              </h1>
              <p className="text-xs text-amber-300/80 font-mono">&gt; Knowledge Quest</p>
            </div>
          </div>

          {/* Center Stats */}
          <div className="hidden lg:flex items-center space-x-6">
            {streakData && streakData.current > 0 && (
              <div className="flex items-center space-x-2 bg-gradient-to-r from-amber-900/30 to-orange-900/30 px-4 py-2 rounded border border-amber-500/50">
                <Flame className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-bold text-amber-300 font-mono">{streakData.current} DAY STREAK</span>
              </div>
            )}
            <div className="flex items-center space-x-2 bg-gradient-to-r from-amber-900/30 to-yellow-900/30 px-4 py-2 rounded border border-amber-500/50">
              <Trophy className="w-4 h-4 text-amber-400" />
              <div className="text-left">
                <div className="text-sm font-bold text-amber-300 font-mono">LEVEL {levelData.level}</div>
                <div className="text-xs text-amber-400/80 font-mono">{levelData.levelTitle.title}</div>
              </div>
            </div>
            <div className="flex items-center space-x-2 bg-gradient-to-r from-amber-900/30 to-orange-900/30 px-4 py-2 rounded border border-amber-500/50">
              <div className="w-4 h-4 text-amber-400">⚔️</div>
              <div className="text-left">
                <div className="text-sm font-bold text-amber-300 font-mono">{levelData.totalXP} XP</div>
                <div className="text-xs text-amber-400/80 font-mono">{levelData.progress}% TO NEXT</div>
              </div>
            </div>
          </div>

          {/* Right Side Controls */}
          <div className="flex items-center space-x-3">
            {/* Storage Mode Toggle */}
            <div className="flex items-center bg-amber-900/20 backdrop-blur-sm rounded border border-amber-500/30 p-1">
              <button
                onClick={() => onStorageModeChange('local')}
                className={`p-2 rounded transition-all duration-300 ${
                  storageMode === 'local' 
                    ? 'bg-amber-500/30 text-amber-300 shadow-lg' 
                    : 'text-amber-400/60 hover:text-amber-300 hover:bg-amber-500/20'
                }`}
                title="Local Storage"
              >
                <HardDrive size={16} />
              </button>
              <button
                onClick={() => onStorageModeChange('cloud')}
                className={`p-2 rounded transition-all duration-300 ${
                  storageMode === 'cloud' 
                    ? 'bg-amber-500/30 text-amber-300 shadow-lg' 
                    : 'text-amber-400/60 hover:text-amber-300 hover:bg-amber-500/20'
                }`}
                title="Cloud Storage"
              >
                <Cloud size={16} />
              </button>
            </div>

            {/* Settings */}
            <button 
              onClick={() => setShowSettings(true)}
              className="p-2 bg-amber-900/20 backdrop-blur-sm rounded border border-amber-500/30 text-amber-400/80 hover:text-amber-300 hover:bg-amber-500/20 transition-all duration-300"
            >
              <Settings size={18} />
            </button>

            {/* User Authentication */}
            {!user ? (
              <button
                onClick={onAuthModalOpen}
                className="bg-gradient-to-r from-amber-600 to-orange-600 text-white px-4 py-2 rounded border border-amber-400/50 hover:from-amber-700 hover:to-orange-700 transition-all duration-300 font-mono font-bold shadow-lg hover:shadow-amber-500/25 transform hover:-translate-y-0.5 hover:scale-105 flex items-center space-x-2"
              >
                <User size={16} />
                <span>ENTER DUNGEON</span>
              </button>
            ) : (
              <div className="flex items-center space-x-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-amber-300 font-mono">{user.email}</p>
                  <p className="text-xs text-amber-400/60 font-mono">ADVENTURER</p>
                </div>
                <button
                  onClick={onLogout}
                  className="bg-gradient-to-r from-red-600 to-orange-600 text-white px-3 py-2 rounded border border-red-400/50 hover:from-red-700 hover:to-orange-700 transition-all duration-300 font-mono font-bold shadow-lg hover:shadow-red-500/25 transform hover:-translate-y-0.5 hover:scale-105 flex items-center space-x-2"
                >
                  <LogOut size={16} />
                  <span className="hidden sm:inline">EXIT</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>

    {/* Settings Modal */}
    {showSettings && (
      <SettingsModal 
        onClose={() => setShowSettings(false)}
        user={user}
        onUpdateProfile={handleUpdateProfile}
        levelData={levelData}
        achievements={achievements}
        selectedCustomizations={selectedCustomizations}
        onCustomizationChange={onCustomizationChange}
      />
    )}
  </>
  );
};

export default Header;
