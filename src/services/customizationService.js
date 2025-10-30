// Customization Service
// Manages unlockable themes, avatars, backgrounds, and visual customizations

export const CUSTOMIZATION_CONFIG = {
  // Avatar unlocks
  AVATARS: {
    default: {
      id: 'default',
      name: 'Default Brain',
      emoji: '🧠',
      unlocked: true,
      level: 1,
      description: 'Your trusty study companion'
    },
    level2: {
      id: 'level2',
      name: 'Curious Cat',
      emoji: '🐱',
      unlocked: false,
      level: 2,
      description: 'Curious and always learning'
    },
    level3: {
      id: 'level3',
      name: 'Wise Owl',
      emoji: '🦉',
      unlocked: false,
      level: 3,
      description: 'Wise and knowledgeable'
    },
    level5: {
      id: 'level5',
      name: 'Study Dragon',
      emoji: '🐉',
      unlocked: false,
      level: 5,
      description: 'Breathes fire into your studies'
    },
    level7: {
      id: 'level7',
      name: 'Phoenix Scholar',
      emoji: '🦅',
      unlocked: false,
      level: 7,
      description: 'Rises from the ashes of ignorance'
    },
    level10: {
      id: 'level10',
      name: 'Cosmic Brain',
      emoji: '🌌',
      unlocked: false,
      level: 10,
      description: 'Mind expanding like the universe'
    },
    level15: {
      id: 'level15',
      name: 'Immortal Sage',
      emoji: '👑',
      unlocked: false,
      level: 15,
      description: 'Beyond mortal comprehension'
    },
    streak7: {
      id: 'streak7',
      name: 'Flame Keeper',
      emoji: '🔥',
      unlocked: false,
      level: 0,
      requirement: 'streak7',
      description: '7-day study streak'
    },
    streak30: {
      id: 'streak30',
      name: 'Streak Master',
      emoji: '⚡',
      unlocked: false,
      level: 0,
      requirement: 'streak30',
      description: '30-day study streak'
    },
    cards50: {
      id: 'cards50',
      name: 'Card Creator',
      emoji: '📝',
      unlocked: false,
      level: 0,
      requirement: 'cards50',
      description: 'Created 50 flashcards'
    },
    cards200: {
      id: 'cards200',
      name: 'Card Master',
      emoji: '🎯',
      unlocked: false,
      level: 0,
      requirement: 'cards200',
      description: 'Created 200 flashcards'
    }
  },

  // Background themes
  BACKGROUNDS: {
    default: {
      id: 'default',
      name: 'Ancient Crypt',
      gradient: 'from-slate-900 via-gray-900 to-black',
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      unlocked: true,
      level: 1,
      description: 'Dark stone walls and flickering torches'
    },
    level3: {
      id: 'level3',
      name: 'Crystal Caverns',
      gradient: 'from-blue-900 via-cyan-500 to-teal-900',
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.2'%3E%3Cpath d='M0 0h20v20H0zM20 20h20v20H20z'/%3E%3Cpath d='M20 0h20v20H20zM0 20h20v20H0z'/%3E%3C/g%3E%3C/svg%3E")`,
      unlocked: false,
      level: 3,
      description: 'Glowing blue crystals in underground chambers'
    },
    level5: {
      id: 'level5',
      name: 'Forest Temple',
      gradient: 'from-green-800 via-emerald-600 to-green-900',
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.08'%3E%3Cpath d='M30 0l15 15v30H15V15L30 0z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      unlocked: false,
      level: 5,
      description: 'Ancient ruins overgrown with mystical vines'
    },
    level7: {
      id: 'level7',
      name: 'Volcanic Forge',
      gradient: 'from-orange-600 via-red-500 to-pink-600',
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M20 0c11.046 0 20 8.954 20 20s-8.954 20-20 20S0 31.046 0 20 8.954 0 20 0zm0 2C10.06 2 2 10.06 2 20s8.06 18 18 18 18-8.06 18-18S29.94 2 20 2z'/%3E%3C/g%3E%3C/svg%3E")`,
      unlocked: false,
      level: 7,
      description: 'Molten lava pools and blacksmith\'s anvils'
    },
    level10: {
      id: 'level10',
      name: 'Shadow Realm',
      gradient: 'from-indigo-800 via-purple-600 to-pink-500',
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.06'%3E%3Cpath d='M30 0l30 30-30 30L0 30z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      unlocked: false,
      level: 10,
      description: 'Ethereal shadows dance in the darkness'
    },
    level15: {
      id: 'level15',
      name: 'Dragon\'s Lair',
      gradient: 'from-yellow-600 via-orange-500 to-red-600',
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M20 0c11.046 0 20 8.954 20 20s-8.954 20-20 20S0 31.046 0 20 8.954 0 20 0zm0 2C10.06 2 2 10.06 2 20s8.06 18 18 18 18-8.06 18-18S29.94 2 20 2z'/%3E%3C/g%3E%3C/svg%3E")`,
      unlocked: false,
      level: 15,
      description: 'Massive hoard of gold and ancient artifacts'
    },
    streak7: {
      id: 'streak7',
      name: 'Fire Temple',
      gradient: 'from-red-800 via-orange-600 to-yellow-500',
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.08'%3E%3Cpath d='M30 0l15 15v30H15V15L30 0z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      unlocked: false,
      level: 0,
      requirement: 'streak7',
      description: 'Sacred flames burn eternally'
    },
    cards50: {
      id: 'cards50',
      name: 'Knowledge Vault',
      gradient: 'from-purple-800 via-indigo-600 to-blue-500',
      backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.2'%3E%3Cpath d='M0 0h20v20H0zM20 20h20v20H20z'/%3E%3Cpath d='M10 0h20v20H10zM0 20h20v20H0z'/%3E%3Cpath d='M20 0h20v20H20zM10 20h20v20H10z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      unlocked: false,
      level: 0,
      requirement: 'cards50',
      description: 'Ancient tomes and magical scrolls'
    }
  },


};

// Check if customization is unlocked based on level and achievements
export const isCustomizationUnlocked = (customization, userLevel, achievements, stats) => {
  // Always unlocked if explicitly set
  if (customization.unlocked) return true;
  
  // Check level requirement
  if (customization.level && userLevel >= customization.level) return true;
  
  // Check specific requirements
  if (customization.requirement) {
    switch (customization.requirement) {
      case 'streak7':
        return stats.currentStreak >= 7;
      case 'streak30':
        return stats.currentStreak >= 30;
      case 'cards50':
        return stats.totalCardsCreated >= 50;
      case 'cards200':
        return stats.totalCardsCreated >= 200;
      case 'perfectSession':
        return achievements.some(a => a.id === 'perfectSession');
      default:
        return false;
    }
  }
  
  return false;
};

// Get all unlocked customizations
export const getUnlockedCustomizations = (userLevel, achievements, stats) => {
  const unlocked = {
    avatars: [],
    backgrounds: []
  };

  // Check avatars
  Object.values(CUSTOMIZATION_CONFIG.AVATARS).forEach(avatar => {
    if (isCustomizationUnlocked(avatar, userLevel, achievements, stats)) {
      unlocked.avatars.push(avatar);
    }
  });

  // Check backgrounds
  Object.values(CUSTOMIZATION_CONFIG.BACKGROUNDS).forEach(bg => {
    if (isCustomizationUnlocked(bg, userLevel, achievements, stats)) {
      unlocked.backgrounds.push(bg);
    }
  });

  return unlocked;
};

// Get next unlockable customizations
export const getNextUnlocks = (userLevel, achievements, stats) => {
  const nextUnlocks = {
    avatars: [],
    backgrounds: []
  };

  // Find next avatar unlocks
  Object.values(CUSTOMIZATION_CONFIG.AVATARS).forEach(avatar => {
    if (!isCustomizationUnlocked(avatar, userLevel, achievements, stats)) {
      nextUnlocks.avatars.push(avatar);
    }
  });

  // Find next background unlocks
  Object.values(CUSTOMIZATION_CONFIG.BACKGROUNDS).forEach(bg => {
    if (!isCustomizationUnlocked(bg, userLevel, achievements, stats)) {
      nextUnlocks.backgrounds.push(bg);
    }
  });

  return nextUnlocks;
};

// Apply customization to app theme
export const applyCustomization = (customization, type) => {
  switch (type) {
    case 'background':
      return {
        className: `bg-gradient-to-r ${customization.gradient}`,
        style: customization.backgroundImage ? { backgroundImage: customization.backgroundImage } : {}
      };
    case 'cardTheme':
      return `${customization.bgColor} ${customization.borderColor}`;
    case 'animation':
      return customization.className;
    default:
      return '';
  }
};

// Get background gradient classes and image
export const getBackgroundClasses = (backgroundId) => {
  const background = CUSTOMIZATION_CONFIG.BACKGROUNDS[backgroundId];
  
  if (!background) {
    return {
      className: 'from-slate-900 via-gray-900 to-black',
      style: {}
    };
  }
  
  return {
    className: background.gradient,
    style: background.backgroundImage ? { backgroundImage: background.backgroundImage } : {}
  };
};


