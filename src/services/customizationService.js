// 🎨 Customization Service
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
      name: 'Classic Purple',
      gradient: 'from-purple-900 via-indigo-900 to-purple-900',
      unlocked: true,
      level: 1,
      description: 'Elegant and professional'
    },
    level3: {
      id: 'level3',
      name: 'Ocean Depths',
      gradient: 'from-blue-900 via-cyan-500 to-teal-900',
      unlocked: false,
      level: 3,
      description: 'Deep and calming'
    },
    level5: {
      id: 'level5',
      name: 'Forest Wisdom',
      gradient: 'from-green-800 via-emerald-600 to-green-900',
      unlocked: false,
      level: 5,
      description: 'Natural and peaceful'
    },
    level7: {
      id: 'level7',
      name: 'Sunset Glow',
      gradient: 'from-orange-600 via-red-500 to-pink-600',
      unlocked: false,
      level: 7,
      description: 'Warm and inspiring'
    },
    level10: {
      id: 'level10',
      name: 'Galaxy Explorer',
      gradient: 'from-indigo-800 via-purple-600 to-pink-500',
      unlocked: false,
      level: 10,
      description: 'Cosmic and mysterious'
    },
    level15: {
      id: 'level15',
      name: 'Golden Age',
      gradient: 'from-yellow-600 via-orange-500 to-red-600',
      unlocked: false,
      level: 15,
      description: 'Legendary and prestigious'
    },
    streak7: {
      id: 'streak7_bg',
      name: 'Flame Theme',
      gradient: 'from-red-800 via-orange-600 to-yellow-500',
      unlocked: false,
      level: 0,
      requirement: 'streak7',
      description: 'Burning with determination'
    },
    perfectSession: {
      id: 'perfectSession',
      name: 'Perfect Score',
      gradient: 'from-green-700 via-emerald-500 to-teal-600',
      unlocked: false,
      level: 0,
      requirement: 'perfectSession',
      description: '100% accuracy achievement'
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
      return `bg-gradient-to-r ${customization.gradient}`;
    case 'cardTheme':
      return `${customization.bgColor} ${customization.borderColor}`;
    case 'animation':
      return customization.className;
    default:
      return '';
  }
};

// Get background gradient classes
export const getBackgroundClasses = (backgroundId) => {
  const background = CUSTOMIZATION_CONFIG.BACKGROUNDS[backgroundId];
  if (!background) {
    return 'from-purple-900 via-blue-900 to-indigo-900'; // default
  }
  return background.gradient;
};


