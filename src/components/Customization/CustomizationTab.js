import React, { useState } from 'react';
import { 
  Palette, Lock, Check, Trophy, 
  Target, Brain
} from 'lucide-react';
import { 
  getUnlockedCustomizations, 
  CUSTOMIZATION_CONFIG
} from '../../services/customizationService';
import { getLevelStats, getAchievements } from '../../services/levelService';

const CustomizationTab = ({ 
  studyLogs, 
  flashcards, 
  blurts, 
  streakData,
  selectedCustomizations,
  onCustomizationChange,
  devLevel = 1,
  user
}) => {
  const [activeTab, setActiveTab] = useState('avatars');

  // Get user data for customization unlocks (use dev level for testing)
  const levelData = getLevelStats(studyLogs, flashcards, blurts, streakData);
  const achievements = getAchievements(levelData, levelData.stats);
  const unlockedCustomizations = getUnlockedCustomizations(devLevel, achievements, levelData.stats);

  const tabs = [
    { id: 'avatars', name: 'Avatars', icon: Brain, color: 'from-amber-600 to-orange-700', configKey: 'AVATARS' },
    { id: 'backgrounds', name: 'Backgrounds', icon: Palette, color: 'from-amber-600 to-orange-700', configKey: 'BACKGROUNDS' }
  ];

  const renderCustomizationItem = (item, type) => {
    const isSelected = selectedCustomizations[type] === item.id;
    const isUnlocked = (unlockedCustomizations[type] || []).some(u => u.id === item.id);
    
    return (
      <div
        key={item.id}
        className={`relative group cursor-pointer rounded-2xl border-2 transition-all duration-300 ${
          isSelected 
            ? 'border-white/60 bg-white/20 shadow-2xl scale-105' 
            : isUnlocked 
              ? 'border-white/20 bg-white/10 hover:border-white/40 hover:bg-white/15 hover:scale-105' 
              : 'border-white/10 bg-white/5 opacity-50'
        }`}
        onClick={() => {
          if (!user) {
            alert('Please sign in to customize your profile');
            return;
          }
          if (isUnlocked) {
            onCustomizationChange(type, item.id);
          }
        }}
      >
        {/* Lock overlay for locked items */}
        {!isUnlocked && (
          <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center z-10">
            <Lock className="text-white/60" size={24} />
          </div>
        )}

        {/* Selected indicator */}
        {isSelected && (
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
            <Check className="text-white" size={14} />
          </div>
        )}

        <div className="p-6">
          {/* Avatar display */}
          {type === 'avatars' && (
            <div className="text-center mb-4">
              <div className={`text-6xl mb-3 ${isSelected ? 'animate-bounce' : ''}`}>
                {item.emoji}
              </div>
              <h3 className="text-lg font-bold text-white mb-1">{item.name}</h3>
              <p className="text-white/60 text-sm">{item.description}</p>
            </div>
          )}

          {/* Background preview */}
          {type === 'backgrounds' && (
            <div className="text-center mb-4">
              <div 
                className={`w-full h-20 rounded-xl mb-3 bg-gradient-to-r ${item.gradient} border border-white/20 relative overflow-hidden`}
              >
                <div className="absolute bottom-1 right-1 text-xs text-white/80 font-bold drop-shadow-lg">
                  {item.level > 0 ? `Lv.${item.level}` : (item.requirement === 'streak7' ? '7 Day Streak' : item.requirement === 'cards50' ? '50 Cards' : item.requirement)}
                </div>
              </div>
              <h3 className="text-lg font-bold text-white mb-1">{item.name}</h3>
              <p className="text-white/60 text-sm">{item.description}</p>
            </div>
          )}



          {/* Unlock requirement */}
          {!isUnlocked && (
            <div className="text-center">
              {item.level > 0 && (
                <div className="flex items-center justify-center space-x-2 text-white/60 text-sm">
                  <Target size={14} />
                  <span>Level {item.level}</span>
                </div>
              )}
              {item.requirement && (
                <div className="flex items-center justify-center space-x-2 text-white/60 text-sm">
                  <Trophy size={14} />
                  <span>{item.requirement}</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-6 space-y-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-4xl font-black bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent mb-4">
          Customize Your Experience 🎨
        </h2>
        <p className="text-white/80 text-lg">
          Unlock and personalize your study environment as you progress!
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gradient-to-br from-amber-900/20 to-black/50 backdrop-blur-xl rounded-lg border-2 border-amber-400/50 p-4 text-center">
          <div className="text-2xl font-black text-amber-400 font-mono">{levelData.level}</div>
          <div className="text-amber-300 text-sm font-mono">CURRENT LEVEL</div>
        </div>
        <div className="bg-gradient-to-br from-amber-900/20 to-black/50 backdrop-blur-xl rounded-lg border-2 border-amber-400/50 p-4 text-center">
          <div className="text-2xl font-black text-amber-400 font-mono">{unlockedCustomizations.avatars.length}</div>
          <div className="text-amber-300 text-sm font-mono">AVATARS UNLOCKED</div>
        </div>
        <div className="bg-gradient-to-br from-amber-900/20 to-black/50 backdrop-blur-xl rounded-lg border-2 border-amber-400/50 p-4 text-center">
          <div className="text-2xl font-black text-amber-400 font-mono">{unlockedCustomizations.backgrounds.length}</div>
          <div className="text-amber-300 text-sm font-mono">DUNGEONS UNLOCKED</div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-2">
        <div className="grid grid-cols-2 gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const configData = CUSTOMIZATION_CONFIG[tab.configKey] || {};
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`p-4 rounded-xl transition-all duration-300 font-medium text-center ${
                  activeTab === tab.id 
                    ? `bg-gradient-to-r ${tab.color} text-white shadow-2xl transform scale-105` 
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className="mx-auto mb-2" size={20} />
                <div className="text-sm font-bold">{tab.name}</div>
                <div className="text-xs opacity-80">
                  {(unlockedCustomizations[tab.id] || []).length}/{Object.keys(configData).length}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Customization Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-2xl font-bold text-white capitalize">
            {activeTab} ({(unlockedCustomizations[activeTab] || []).length} unlocked)
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(() => {
            const currentTab = tabs.find(tab => tab.id === activeTab);
            const configData = currentTab ? CUSTOMIZATION_CONFIG[currentTab.configKey] || {} : {};
            return Object.values(configData).map(item => 
              renderCustomizationItem(item, activeTab)
            );
          })()}
        </div>
      </div>



    </div>
  );
};

export default CustomizationTab;
