import React, { useState } from 'react';
import { 
  Settings, Zap, Star, Crown, Target, Flame, 
  Play, RotateCcw, Palette, Trophy, Award
} from 'lucide-react';
import { CUSTOMIZATION_CONFIG } from '../../services/customizationService';

const DevTestPanel = ({ 
  onSetLevel, 
  onSetCustomizations, 
  onSetAchievements, 
  onSetStats,
  currentLevel,
  selectedCustomizations,
  achievements,
  stats
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('levels');

  // Quick level presets
  const levelPresets = [
    { name: 'Level 1 (Default)', level: 1, xp: 0 },
    { name: 'Level 5 (Study Enthusiast)', level: 5, xp: 1000 },
    { name: 'Level 10 (Learning Legend)', level: 10, xp: 32000 },
    { name: 'Level 15 (Study Immortal)', level: 15, xp: 1024000 },
    { name: 'Max Level', level: 15, xp: 2000000 }
  ];

  // Quick achievement presets
  const achievementPresets = [
    { name: 'None', achievements: [] },
    { name: 'Basic Achievements', achievements: ['level5', 'weekStreak', 'cards50'] },
    { name: 'Advanced Achievements', achievements: ['level10', 'monthStreak', 'cards200', 'studyTime1k'] },
    { name: 'All Achievements', achievements: ['level5', 'level10', 'level15', 'weekStreak', 'monthStreak', 'centuryStreak', 'studyTime1k', 'studyTime5k', 'cards50', 'cards200', 'reviews500'] }
  ];

  // Quick stats presets
  const statsPresets = [
    { name: 'New User', stats: { totalStudyTime: 0, totalCardsCreated: 0, totalCardsReviewed: 0, currentStreak: 0, longestStreak: 0 } },
    { name: 'Active User', stats: { totalStudyTime: 500, totalCardsCreated: 25, totalCardsReviewed: 100, currentStreak: 7, longestStreak: 15 } },
    { name: 'Power User', stats: { totalStudyTime: 2000, totalCardsCreated: 100, totalCardsReviewed: 500, currentStreak: 30, longestStreak: 45 } },
    { name: 'Study Master', stats: { totalStudyTime: 5000, totalCardsCreated: 250, totalCardsReviewed: 1000, currentStreak: 100, longestStreak: 100 } }
  ];

  const unlockAllCustomizations = () => {
    const allCustomizations = {
      avatars: 'level15', // Most prestigious avatar
      backgrounds: 'level15' // Golden age background
    };
    onSetCustomizations(allCustomizations);
  };

  const resetToDefaults = () => {
    onSetLevel(1);
    onSetCustomizations({
      avatars: 'default',
      backgrounds: 'default'
    });
    onSetAchievements([]);
    onSetStats({
      totalStudyTime: 0,
      totalCardsCreated: 0,
      totalCardsReviewed: 0,
      currentStreak: 0,
      longestStreak: 0
    });
  };

  const testAllCustomizations = () => {
    // Cycle through different customization combinations
    const testCombinations = [
      { avatars: 'level2', backgrounds: 'level3' },
      { avatars: 'level5', backgrounds: 'level5' },
      { avatars: 'level10', backgrounds: 'level10' },
      { avatars: 'level15', backgrounds: 'level15' },
      { avatars: 'streak7', backgrounds: 'streak7_bg' },
      { avatars: 'cards50', backgrounds: 'default' }
    ];

    let currentIndex = 0;
    const interval = setInterval(() => {
      onSetCustomizations(testCombinations[currentIndex]);
      currentIndex = (currentIndex + 1) % testCombinations.length;
      
      if (currentIndex === 0) {
        clearInterval(interval);
        alert('Customization test cycle complete!');
      }
    }, 2000); // Change every 2 seconds
  };

  return (
    <>
      {/* Dev Tools Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-50 bg-gradient-to-r from-red-500 to-pink-500 text-white p-3 rounded-full shadow-2xl hover:from-red-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-110"
        title="Developer Tools"
      >
        <Settings size={20} />
      </button>

      {/* Dev Panel */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-lg">
          <div className="bg-gradient-to-br from-gray-900/95 to-black/95 backdrop-blur-xl rounded-3xl p-8 max-w-4xl mx-4 shadow-2xl border border-white/20 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white flex items-center">
                <Zap className="mr-3 text-yellow-400" size={24} />
                Developer Testing Panel
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white/60 hover:text-white transition-colors"
              >
                x
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex space-x-2 mb-6">
              {[
                { id: 'levels', name: 'Levels', icon: Crown },
                { id: 'customizations', name: 'Customizations', icon: Palette },
                { id: 'achievements', name: 'Achievements', icon: Trophy },
                { id: 'stats', name: 'Stats', icon: Target },
                { id: 'quick', name: 'Quick Tests', icon: Play }
              ].map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl transition-all duration-300 ${
                      activeTab === tab.id 
                        ? 'bg-gradient-to-r from-amber-600 to-orange-700 text-white' 
                        : 'bg-amber-900/20 text-amber-300/80 hover:text-amber-300 hover:bg-amber-500/20'
                    }`}
                  >
                    <Icon size={16} />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </div>

            {/* Levels Tab */}
            {activeTab === 'levels' && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white mb-4">Quick Level Testing</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {levelPresets.map(preset => (
                    <button
                      key={preset.name}
                      onClick={() => onSetLevel(preset.level)}
                      className="bg-white/10 rounded-xl p-4 text-left hover:bg-white/20 transition-all duration-300 border border-white/20"
                    >
                      <div className="font-bold text-white">{preset.name}</div>
                      <div className="text-white/60 text-sm">Level {preset.level} - {preset.xp.toLocaleString()} XP</div>
                    </button>
                  ))}
                </div>
                <div className="flex space-x-4 mt-6">
                  <button
                    onClick={() => onSetLevel(Math.min(currentLevel + 1, 15))}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 py-2 rounded-xl font-bold"
                  >
                    Level Up (+1)
                  </button>
                  <button
                    onClick={() => onSetLevel(Math.max(currentLevel - 1, 1))}
                    className="bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-xl font-bold"
                  >
                    Level Down (-1)
                  </button>
                </div>
              </div>
            )}

            {/* Customizations Tab */}
            {activeTab === 'customizations' && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white mb-4">Customization Testing</h3>
                
                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <button
                    onClick={unlockAllCustomizations}
                    className="bg-gradient-to-r from-amber-600 to-orange-700 text-white p-4 rounded border-2 border-amber-400/50 font-mono font-bold hover:from-amber-700 hover:to-orange-800 transition-all duration-300"
                  >
                    <Star className="mx-auto mb-2" size={24} />
                    Unlock All
                  </button>
                  <button
                    onClick={testAllCustomizations}
                    className="bg-gradient-to-r from-amber-600 to-orange-700 text-white p-4 rounded border-2 border-amber-400/50 font-mono font-bold hover:from-amber-700 hover:to-orange-800 transition-all duration-300"
                  >
                    <Play className="mx-auto mb-2" size={24} />
                    Test Cycle
                  </button>
                  <button
                    onClick={resetToDefaults}
                    className="bg-gradient-to-r from-gray-500 to-gray-600 text-white p-4 rounded-xl font-bold hover:from-gray-600 hover:to-gray-700 transition-all duration-300"
                  >
                    <RotateCcw className="mx-auto mb-2" size={24} />
                    Reset All
                  </button>
                </div>

                {/* Individual Customization Controls */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(CUSTOMIZATION_CONFIG).map(([category, items]) => (
                    <div key={category} className="bg-white/10 rounded-xl p-4">
                      <h4 className="font-bold text-white mb-3 capitalize">{category.replace('_', ' ')}</h4>
                      <div className="space-y-2">
                        {Object.entries(items).slice(0, 5).map(([id, item]) => (
                          <button
                            key={id}
                            onClick={() => {
                              const categoryKey = category === 'AVATARS' ? 'avatars' :
                                                category === 'BACKGROUNDS' ? 'backgrounds' :
                                                category === 'CARD_THEMES' ? 'cardThemes' :
                                                category === 'ANIMATIONS' ? 'animations' : 'sounds';
                              onSetCustomizations(prev => ({
                                ...prev,
                                [categoryKey]: id
                              }));
                            }}
                            className={`w-full text-left p-2 rounded-lg transition-all duration-300 ${
                              selectedCustomizations[category.toLowerCase().replace('_', '')] === id
                                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
                                : 'bg-white/5 text-white/80 hover:bg-white/10 hover:text-white'
                            }`}
                          >
                            <div className="flex items-center space-x-2">
                              {category === 'AVATARS' && <span className="text-lg">{item.emoji}</span>}
                              <span className="text-sm">{item.name}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Achievements Tab */}
            {activeTab === 'achievements' && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white mb-4">Achievement Testing</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {achievementPresets.map(preset => (
                    <button
                      key={preset.name}
                      onClick={() => onSetAchievements(preset.achievements)}
                      className="bg-white/10 rounded-xl p-4 text-left hover:bg-white/20 transition-all duration-300 border border-white/20"
                    >
                      <div className="font-bold text-white">{preset.name}</div>
                      <div className="text-white/60 text-sm">{preset.achievements.length} achievements</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Stats Tab */}
            {activeTab === 'stats' && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white mb-4">Stats Testing</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {statsPresets.map(preset => (
                    <button
                      key={preset.name}
                      onClick={() => onSetStats(preset.stats)}
                      className="bg-white/10 rounded-xl p-4 text-left hover:bg-white/20 transition-all duration-300 border border-white/20"
                    >
                      <div className="font-bold text-white">{preset.name}</div>
                      <div className="text-white/60 text-sm">
                        {preset.stats.totalStudyTime}min - {preset.stats.totalCardsCreated} cards - {preset.stats.currentStreak} streak
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Tests Tab */}
            {activeTab === 'quick' && (
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-white mb-4">Quick Test Scenarios</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => {
                      onSetLevel(5);
                      onSetCustomizations({ avatars: 'level5', backgrounds: 'level5', cardThemes: 'level4', animations: 'level5', sounds: 'level5' });
                      onSetAchievements(['level5', 'weekStreak', 'cards50']);
                      onSetStats({ totalStudyTime: 500, totalCardsCreated: 25, totalCardsReviewed: 100, currentStreak: 7, longestStreak: 15 });
                    }}
                    className="bg-gradient-to-r from-green-500 to-emerald-500 text-white p-4 rounded-xl font-bold hover:from-green-600 hover:to-emerald-600 transition-all duration-300"
                  >
                    <Target className="mx-auto mb-2" size={24} />
                    Active User (Level 5)
                  </button>
                  <button
                    onClick={() => {
                      onSetLevel(10);
                      onSetCustomizations({ avatars: 'level10', backgrounds: 'level10', cardThemes: 'level8', animations: 'level10', sounds: 'level10' });
                      onSetAchievements(['level5', 'level10', 'monthStreak', 'cards200', 'studyTime1k']);
                      onSetStats({ totalStudyTime: 2000, totalCardsCreated: 100, totalCardsReviewed: 500, currentStreak: 30, longestStreak: 45 });
                    }}
                    className="bg-gradient-to-r from-amber-600 to-orange-700 text-white p-4 rounded border-2 border-amber-400/50 font-mono font-bold hover:from-amber-700 hover:to-orange-800 transition-all duration-300"
                  >
                    <Crown className="mx-auto mb-2" size={24} />
                    Power User (Level 10)
                  </button>
                  <button
                    onClick={() => {
                      onSetLevel(15);
                      onSetCustomizations({ avatars: 'level15', backgrounds: 'level15', cardThemes: 'level12', animations: 'level10', sounds: 'level10' });
                      onSetAchievements(['level5', 'level10', 'level15', 'centuryStreak', 'studyTime5k', 'cards200', 'reviews500']);
                      onSetStats({ totalStudyTime: 5000, totalCardsCreated: 250, totalCardsReviewed: 1000, currentStreak: 100, longestStreak: 100 });
                    }}
                    className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white p-4 rounded-xl font-bold hover:from-yellow-600 hover:to-orange-600 transition-all duration-300"
                  >
                    <Award className="mx-auto mb-2" size={24} />
                    Study Master (Level 15)
                  </button>
                  <button
                    onClick={() => {
                      onSetLevel(3);
                      onSetCustomizations({ avatars: 'streak7', backgrounds: 'streak7_bg', cardThemes: 'default', animations: 'level3', sounds: 'default' });
                      onSetAchievements(['weekStreak']);
                      onSetStats({ totalStudyTime: 200, totalCardsCreated: 10, totalCardsReviewed: 50, currentStreak: 7, longestStreak: 7 });
                    }}
                    className="bg-gradient-to-r from-red-500 to-pink-500 text-white p-4 rounded-xl font-bold hover:from-red-600 hover:to-pink-600 transition-all duration-300"
                  >
                    <Flame className="mx-auto mb-2" size={24} />
                    Streak User (7-day)
                  </button>
                </div>
              </div>
            )}

            {/* Current Status */}
            <div className="mt-8 p-4 bg-white/5 rounded-xl border border-white/20">
              <h4 className="font-bold text-white mb-3">Current Status</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-white/60">Level:</span>
                  <div className="text-white font-bold">{currentLevel}</div>
                </div>
                <div>
                  <span className="text-white/60">Avatar:</span>
                  <div className="text-white font-bold">{selectedCustomizations.avatars}</div>
                </div>
                <div>
                  <span className="text-white/60">Background:</span>
                  <div className="text-white font-bold">{selectedCustomizations.backgrounds}</div>
                </div>
                <div>
                  <span className="text-white/60">Achievements:</span>
                  <div className="text-white font-bold">{achievements.length}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DevTestPanel;
