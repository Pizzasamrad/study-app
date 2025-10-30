import React, { useState, useEffect } from 'react';
import { Settings, X, User, Palette, Save, Lock } from 'lucide-react';

const SettingsModal = ({ onClose, user, onUpdateProfile, levelData, achievements = [], selectedCustomizations, onCustomizationChange }) => {
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [username, setUsername] = useState(user?.displayName || user?.email?.split('@')[0] || '');
  const [selectedAvatar, setSelectedAvatar] = useState(user?.avatar || selectedCustomizations?.avatars || 'default');

  // Avatar unlock requirements - matching customization service exactly
  const avatarUnlocks = {
    'default': { level: 1, achievement: null, name: 'Default Brain', emoji: '🧠' },
    'level2': { level: 2, achievement: null, name: 'Curious Cat', emoji: '🐱' },
    'level3': { level: 3, achievement: null, name: 'Wise Owl', emoji: '🦉' },
    'level5': { level: 5, achievement: null, name: 'Study Dragon', emoji: '🐉' },
    'level7': { level: 7, achievement: null, name: 'Phoenix Scholar', emoji: '🦅' },
    'level10': { level: 10, achievement: null, name: 'Cosmic Brain', emoji: '🌌' },
    'level15': { level: 15, achievement: null, name: 'Immortal Sage', emoji: '👑' },
    'streak7': { level: 0, achievement: 'weekStreak', name: 'Flame Keeper', emoji: '🔥' },
    'streak30': { level: 0, achievement: 'monthStreak', name: 'Streak Master', emoji: '⚡' },
    'cards50': { level: 0, achievement: 'cards50', name: 'Card Creator', emoji: '📝' },
    'cards200': { level: 0, achievement: 'cards200', name: 'Card Master', emoji: '🎯' }
  };

  // Dungeon-themed background options with XP requirements
  const backgrounds = {
    'default': { 
      name: 'Ancient Crypt', 
      gradient: 'from-slate-900 via-gray-900 to-black',
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      level: 1,
      description: 'Dark stone walls and flickering torches'
    },
    'level3': { 
      name: 'Crystal Caverns', 
      gradient: 'from-blue-900 via-cyan-500 to-teal-900',
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.2'%3E%3Cpath d='M0 0h20v20H0zM20 20h20v20H20z'/%3E%3Cpath d='M20 0h20v20H20zM0 20h20v20H0z'/%3E%3C/g%3E%3C/svg%3E")`,
      level: 3,
      description: 'Glowing blue crystals in underground chambers'
    },
    'level5': { 
      name: 'Forest Temple', 
      gradient: 'from-green-800 via-emerald-600 to-green-900',
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.08'%3E%3Cpath d='M30 0l15 15v30H15V15L30 0z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      level: 5,
      description: 'Ancient ruins overgrown with mystical vines'
    },
    'level7': { 
      name: 'Volcanic Forge', 
      gradient: 'from-orange-600 via-red-500 to-pink-600',
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M20 0c11.046 0 20 8.954 20 20s-8.954 20-20 20S0 31.046 0 20 8.954 0 20 0zm0 2C10.06 2 2 10.06 2 20s8.06 18 18 18 18-8.06 18-18S29.94 2 20 2z'/%3E%3C/g%3E%3C/svg%3E")`,
      level: 7,
      description: 'Molten lava pools and blacksmith\'s anvils'
    },
    'level10': { 
      name: 'Shadow Realm', 
      gradient: 'from-indigo-800 via-purple-600 to-pink-500',
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.06'%3E%3Cpath d='M30 0l30 30-30 30L0 30z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      level: 10,
      description: 'Ethereal shadows dance in the darkness'
    },
    'level15': { 
      name: 'Dragon\'s Lair', 
      gradient: 'from-yellow-600 via-orange-500 to-red-600',
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M20 0c11.046 0 20 8.954 20 20s-8.954 20-20 20S0 31.046 0 20 8.954 0 20 0zm0 2C10.06 2 2 10.06 2 20s8.06 18 18 18 18-8.06 18-18S29.94 2 20 2z'/%3E%3C/g%3E%3C/svg%3E")`,
      level: 15,
      description: 'Massive hoard of gold and ancient artifacts'
    },
    'streak7': {
      name: 'Fire Temple',
      gradient: 'from-red-800 via-orange-600 to-yellow-500',
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.08'%3E%3Cpath d='M30 0l15 15v30H15V15L30 0z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      level: 0,
      achievement: 'weekStreak',
      description: 'Sacred flames burn eternally'
    },
    'cards50': {
      name: 'Knowledge Vault',
      gradient: 'from-purple-800 via-indigo-600 to-blue-500',
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.2'%3E%3Cpath d='M0 0h20v20H0zM20 20h20v20H20z'/%3E%3Cpath d='M10 0h20v20H10zM0 20h20v20H0z'/%3E%3Cpath d='M20 0h20v20H20zM10 20h20v20H10z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      level: 0,
      achievement: 'cards50',
      description: 'Ancient tomes and magical scrolls'
    }
  };

  // Check if background is unlocked
  const isBackgroundUnlocked = (bgId) => {
    const bg = backgrounds[bgId];
    if (!bg) return false;
    
    // Check level requirement
    if (bg.level > 0 && levelData && levelData.level < bg.level) return false;
    
    // Check achievement requirement
    if (bg.achievement && !achievements.some(a => a.id === bg.achievement)) return false;
    
    return true;
  };

  const availableBackgrounds = Object.entries(backgrounds).filter(([id]) => isBackgroundUnlocked(id));
  const lockedBackgrounds = Object.entries(backgrounds).filter(([id]) => !isBackgroundUnlocked(id));

  // Check if avatar is unlocked
  const isAvatarUnlocked = (avatarId) => {
    const unlock = avatarUnlocks[avatarId];
    if (!unlock) return false;
    
    if (levelData && levelData.level < unlock.level) return false;
    if (unlock.achievement && !achievements.some(a => a.id === unlock.achievement)) return false;
    
    return true;
  };

  const availableAvatars = Object.entries(avatarUnlocks).filter(([id]) => isAvatarUnlocked(id));
  const lockedAvatars = Object.entries(avatarUnlocks).filter(([id]) => !isAvatarUnlocked(id));

  const handleSave = async () => {
    if (!user) {
      alert('Please sign in to update your profile');
      return;
    }
    
    try {
      await onUpdateProfile({
        displayName: username,
        avatar: selectedAvatar
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleCancel = () => {
    setUsername(user?.displayName || user?.email?.split('@')[0] || '');
    setSelectedAvatar(user?.avatar || selectedCustomizations?.avatars || 'default');
    setIsEditing(false);
  };

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div 
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-lg overflow-y-auto p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div className="bg-gradient-to-br from-amber-900/90 to-black/90 backdrop-blur-xl rounded-2xl p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border-2 border-amber-400/50">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-amber-300 flex items-center">
            <Settings size={24} className="mr-2" />
            Settings
          </h2>
          <button 
            onClick={onClose}
            className="text-amber-300 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-lg"
            aria-label="Close settings"
          >
            <X size={24} />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-2 mb-6">
          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded-lg transition-all duration-200 ${
              activeTab === 'profile' 
                ? 'bg-amber-600 text-white' 
                : 'text-amber-300 hover:bg-amber-600/20'
            }`}
          >
            <User size={16} className="inline mr-2" />
            Profile
          </button>
          <button
            onClick={() => setActiveTab('background')}
            className={`px-4 py-2 rounded-lg transition-all duration-200 ${
              activeTab === 'background' 
                ? 'bg-amber-600 text-white' 
                : 'text-amber-300 hover:bg-amber-600/20'
            }`}
          >
            <Palette size={16} className="inline mr-2" />
            Background
          </button>
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-amber-600 to-orange-700 rounded-full flex items-center justify-center shadow-2xl border-2 border-amber-400/50 mx-auto mb-4">
                <span className="text-3xl">
                  {avatarUnlocks[selectedAvatar]?.emoji || '🧠'}
                </span>
              </div>
              <h3 className="text-xl font-bold text-amber-300 mb-2">
                {isEditing ? 'Edit Profile' : 'Profile Settings'}
              </h3>
            </div>

            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-amber-300 font-semibold mb-2">
                    Username
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full p-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                    placeholder="Enter your username"
                    maxLength={20}
                  />
                </div>

                <div>
                  <label className="block text-amber-300 font-semibold mb-3">
                    Choose Avatar
                  </label>
                  
                  {/* Available Avatars */}
                  <div className="mb-4">
                    <h4 className="text-sm text-amber-400 mb-2">Available</h4>
                    <div className="grid grid-cols-4 gap-3">
                      {availableAvatars.map(([avatarId, avatar]) => (
                        <button
                          key={avatarId}
                          onClick={() => {
                            if (!user) {
                              alert('Please sign in to change your avatar');
                              return;
                            }
                            setSelectedAvatar(avatarId);
                          }}
                          className={`p-3 rounded-xl border-2 transition-all duration-200 ${
                            selectedAvatar === avatarId
                              ? 'border-amber-400 bg-amber-500/20 scale-110'
                              : 'border-white/20 hover:border-amber-400/50 hover:bg-white/10'
                          }`}
                          title={avatar.name}
                        >
                          <span className="text-2xl">{avatar.emoji}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Locked Avatars */}
                  {lockedAvatars.length > 0 && (
                    <div>
                      <h4 className="text-sm text-neutral-500 mb-2">Locked</h4>
                      <div className="grid grid-cols-4 gap-3">
                        {lockedAvatars.map(([avatarId, avatar]) => (
                          <div
                            key={avatarId}
                            className="p-3 rounded-xl border-2 border-neutral-600 bg-neutral-800/50 relative cursor-not-allowed opacity-50"
                            title={`Unlock: ${avatarUnlocks[avatarId].level ? `Level ${avatarUnlocks[avatarId].level}` : ''} ${avatarUnlocks[avatarId].achievement ? `+ ${avatarUnlocks[avatarId].achievement}` : ''}`}
                          >
                            <span className="text-2xl">{avatar.emoji}</span>
                            <Lock size={12} className="absolute -top-1 -right-1 text-neutral-400" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={handleSave}
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-green-500/50 flex items-center justify-center"
                  >
                    <Save size={18} className="mr-2" />
                    Save Changes
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex-1 bg-gradient-to-r from-gray-600 to-gray-700 text-white px-6 py-3 rounded-xl hover:from-gray-700 hover:to-gray-800 transition-all duration-300 font-semibold shadow-lg flex items-center justify-center"
                  >
                    <X size={18} className="mr-2" />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-left">
                  <p className="text-amber-300 font-semibold mb-1">Username</p>
                  <p className="text-white text-lg">{username}</p>
                </div>
                
                <div className="text-left">
                  <p className="text-amber-300 font-semibold mb-1">Email</p>
                  <p className="text-white/80">{user?.email}</p>
                </div>

                <div className="text-left">
                  <p className="text-amber-300 font-semibold mb-1">Avatar</p>
                  <p className="text-white/80">
                    {avatarUnlocks[selectedAvatar]?.name || 'Default Brain'}
                  </p>
                </div>

                <div className="text-left">
                  <p className="text-amber-300 font-semibold mb-1">Level</p>
                  <p className="text-white/80">Level {levelData?.level || 1}</p>
                </div>

                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full bg-gradient-to-r from-amber-600 to-orange-600 text-white px-6 py-3 rounded-xl hover:from-amber-700 hover:to-orange-700 transition-all duration-300 font-semibold shadow-lg hover:shadow-amber-500/50 flex items-center justify-center"
                >
                  <User size={18} className="mr-2" />
                  Edit Profile
                </button>
              </div>
            )}
          </div>
        )}

        {/* Background Tab */}
        {activeTab === 'background' && (
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-bold text-amber-300 mb-4">
                Choose Dungeon Theme
              </h3>
              <p className="text-amber-400/80 text-sm">Unlock new dungeons through XP progression</p>
            </div>

            {/* Available Backgrounds */}
            <div className="mb-6">
              <h4 className="text-sm text-amber-400 mb-3 font-semibold">Available Dungeons</h4>
              <div className="grid grid-cols-2 gap-4">
                {availableBackgrounds.map(([bgId, bg]) => (
                  <button
                    key={bgId}
                    onClick={() => {
                      if (!user) {
                        alert('Please sign in to change your background');
                        return;
                      }
                      onCustomizationChange({ backgrounds: bgId });
                    }}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                      selectedCustomizations?.backgrounds === bgId
                        ? 'border-amber-400 bg-amber-500/20 scale-105'
                        : 'border-white/20 hover:border-amber-400/50 hover:bg-white/10'
                    }`}
                  >
                    <div 
                      className={`w-full h-20 rounded-lg bg-gradient-to-r ${bg.gradient} mb-3 border border-white/20 relative overflow-hidden`}
                    >
                      <div className="absolute bottom-1 right-1 text-xs text-white/80 font-bold drop-shadow-lg">
                        {bg.level > 0 ? `Lv.${bg.level}` : (bg.achievement === 'weekStreak' ? '7 Day Streak' : bg.achievement === 'cards50' ? '50 Cards' : bg.achievement)}
                      </div>
                    </div>
                    <h4 className="text-white font-semibold text-sm mb-1">{bg.name}</h4>
                    <p className="text-white/60 text-xs">{bg.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Locked Backgrounds */}
            {lockedBackgrounds.length > 0 && (
              <div>
                <h4 className="text-sm text-neutral-500 mb-3 font-semibold">Locked Dungeons</h4>
                <div className="grid grid-cols-2 gap-4">
                  {lockedBackgrounds.map(([bgId, bg]) => (
                    <div
                      key={bgId}
                      className="p-4 rounded-xl border-2 border-neutral-600 bg-neutral-800/50 relative cursor-not-allowed opacity-50"
                      title={`Unlock: ${bg.level > 0 ? `Level ${bg.level}` : ''} ${bg.achievement ? `+ ${bg.achievement}` : ''}`}
                    >
                      <div 
                        className={`w-full h-20 rounded-lg bg-gradient-to-r ${bg.gradient} mb-3 border border-neutral-600 relative overflow-hidden`}
                      >
                        <div className="absolute bottom-1 right-1 text-xs text-neutral-400 font-bold drop-shadow-lg">
                          {bg.level > 0 ? `Lv.${bg.level}` : (bg.achievement === 'weekStreak' ? '7 Day Streak' : bg.achievement === 'cards50' ? '50 Cards' : bg.achievement)}
                        </div>
                        <Lock size={16} className="absolute top-1 right-1 text-neutral-400" />
                      </div>
                      <h4 className="text-neutral-400 font-semibold text-sm mb-1">{bg.name}</h4>
                      <p className="text-neutral-500 text-xs">{bg.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default SettingsModal;
