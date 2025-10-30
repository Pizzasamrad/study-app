// Comprehensive Level System Service
// Calculates user levels based on multiple factors

export const LEVEL_CONFIG = {
  // XP required for each level (exponential growth)
  XP_PER_LEVEL: [0, 100, 250, 500, 1000, 2000, 4000, 8000, 16000, 32000, 64000, 128000, 256000, 512000, 1024000],
  
  // Level titles and descriptions
  LEVEL_TITLES: {
    1: { title: "Novice Learner", description: "Just getting started" },
    2: { title: "Curious Student", description: "Building good habits" },
    3: { title: "Dedicated Scholar", description: "Consistent studying" },
    4: { title: "Knowledge Seeker", description: "Deepening understanding" },
    5: { title: "Study Enthusiast", description: "Passionate about learning" },
    6: { title: "Academic Explorer", description: "Exploring new subjects" },
    7: { title: "Learning Champion", description: "Mastering techniques" },
    8: { title: "Knowledge Guardian", description: "Protecting wisdom" },
    9: { title: "Study Sage", description: "Wise in learning" },
    10: { title: "Learning Legend", description: "Legendary status" },
    11: { title: "Knowledge Master", description: "Master of all" },
    12: { title: "Study Grandmaster", description: "Grandmaster level" },
    13: { title: "Learning Deity", description: "Divine knowledge" },
    14: { title: "Knowledge God", description: "Omniscient" },
    15: { title: "Study Immortal", description: "Beyond mortal limits" }
  },
  
  // XP rewards for different activities
  XP_REWARDS: {
    STUDY_SESSION: 10, // per minute of study
    CARD_REVIEWED: 5, // per card reviewed
    CARD_CREATED: 15, // per card created
    STREAK_DAY: 20, // per day in streak
    PERFECT_SESSION: 50, // bonus for 100% accuracy
    FIRST_REVIEW: 25, // first review of a card
    MILESTONE: 100, // various milestones
    DAILY_LOGIN: 5, // daily login bonus
    WEEKLY_GOAL: 200, // weekly goal completion
    SUBJECT_MASTERY: 500 // mastering a subject
  }
};

// Calculate total XP from various activities
export const calculateTotalXP = (studyLogs, flashcards, blurts, streakData) => {
  let totalXP = 0;
  
  // XP from study sessions
  if (studyLogs && studyLogs.length > 0) {
    studyLogs.forEach(log => {
      // Base XP for study time (10 XP per minute)
      const studyMinutes = log.duration || 0;
      totalXP += studyMinutes * LEVEL_CONFIG.XP_REWARDS.STUDY_SESSION;
      
      // Bonus for perfect sessions (if accuracy data exists)
      if (log.accuracy === 100) {
        totalXP += LEVEL_CONFIG.XP_REWARDS.PERFECT_SESSION;
      }
    });
  }
  
  // XP from flashcards
  if (flashcards && flashcards.length > 0) {
    flashcards.forEach(card => {
      // XP for creating cards
      totalXP += LEVEL_CONFIG.XP_REWARDS.CARD_CREATED;
      
      // XP for reviews (if review count exists)
      if (card.reviewCount) {
        totalXP += card.reviewCount * LEVEL_CONFIG.XP_REWARDS.CARD_REVIEWED;
      }
      
      // Bonus for first review
      if (card.reviewCount === 1) {
        totalXP += LEVEL_CONFIG.XP_REWARDS.FIRST_REVIEW;
      }
    });
  }
  
  // XP from brain blurts
  if (blurts && blurts.length > 0) {
    totalXP += blurts.length * 5; // 5 XP per blurt
  }
  
  // XP from streak
  if (streakData && streakData.current > 0) {
    totalXP += streakData.current * LEVEL_CONFIG.XP_REWARDS.STREAK_DAY;
  }
  
  // XP from daily logins (estimate based on study logs)
  if (studyLogs && studyLogs.length > 0) {
    const uniqueDays = new Set(studyLogs.map(log => 
      new Date(log.timestamp).toDateString()
    )).size;
    totalXP += uniqueDays * LEVEL_CONFIG.XP_REWARDS.DAILY_LOGIN;
  }
  
  return totalXP;
};

// Calculate current level and progress
export const calculateLevel = (totalXP) => {
  const levels = LEVEL_CONFIG.XP_PER_LEVEL;
  let currentLevel = 1;
  let progress = 0;
  
  // Find current level
  for (let i = 1; i < levels.length; i++) {
    if (totalXP >= levels[i]) {
      currentLevel = i;
    } else {
      break;
    }
  }
  
  // Calculate progress to next level
  if (currentLevel < levels.length - 1) {
    const currentLevelXP = levels[currentLevel];
    const nextLevelXP = levels[currentLevel + 1];
    const xpInCurrentLevel = totalXP - currentLevelXP;
    const xpNeededForNextLevel = nextLevelXP - currentLevelXP;
    progress = Math.round((xpInCurrentLevel / xpNeededForNextLevel) * 100);
  } else {
    progress = 100; // Max level reached
  }
  
  return {
    level: currentLevel,
    progress,
    totalXP,
    xpToNextLevel: currentLevel < levels.length - 1 ? levels[currentLevel + 1] - totalXP : 0,
    levelTitle: LEVEL_CONFIG.LEVEL_TITLES[currentLevel] || { title: "Unknown", description: "Unknown level" }
  };
};

// Get level statistics
export const getLevelStats = (studyLogs, flashcards, blurts, streakData) => {
  const totalXP = calculateTotalXP(studyLogs, flashcards, blurts, streakData);
  const levelData = calculateLevel(totalXP);
  
  // Calculate additional stats
  const totalStudyTime = studyLogs ? studyLogs.reduce((sum, log) => sum + (log.duration || 0), 0) : 0;
  const totalCardsReviewed = flashcards ? flashcards.reduce((sum, card) => sum + (card.reviewCount || 0), 0) : 0;
  const totalCardsCreated = flashcards ? flashcards.length : 0;
  const totalBlurts = blurts ? blurts.length : 0;
  
  return {
    ...levelData,
    stats: {
      totalStudyTime,
      totalCardsReviewed,
      totalCardsCreated,
      totalBlurts,
      currentStreak: streakData?.current || 0,
      longestStreak: streakData?.longest || 0
    }
  };
};

// Get achievements based on level and stats
export const getAchievements = (levelData, stats) => {
  const achievements = [];
  
  // Level-based achievements
  if (levelData.level >= 5) achievements.push({ id: 'level5', title: 'Study Enthusiast', description: 'Reached level 5', icon: '' });
  if (levelData.level >= 10) achievements.push({ id: 'level10', title: 'Learning Legend', description: 'Reached level 10', icon: '' });
  if (levelData.level >= 15) achievements.push({ id: 'level15', title: 'Study Immortal', description: 'Reached max level', icon: '' });
  
  // Streak achievements
  if (stats.currentStreak >= 7) achievements.push({ id: 'weekStreak', title: 'Week Warrior', description: '7-day streak', icon: '' });
  if (stats.currentStreak >= 30) achievements.push({ id: 'monthStreak', title: 'Monthly Master', description: '30-day streak', icon: '' });
  if (stats.longestStreak >= 100) achievements.push({ id: 'centuryStreak', title: 'Century Club', description: '100-day streak', icon: '' });
  
  // Study time achievements
  if (stats.totalStudyTime >= 1000) achievements.push({ id: 'studyTime1k', title: 'Time Master', description: '1000 minutes studied', icon: '' });
  if (stats.totalStudyTime >= 5000) achievements.push({ id: 'studyTime5k', title: 'Study Veteran', description: '5000 minutes studied', icon: '' });
  
  // Card achievements
  if (stats.totalCardsCreated >= 50) achievements.push({ id: 'cards50', title: 'Card Creator', description: 'Created 50 cards', icon: '' });
  if (stats.totalCardsCreated >= 200) achievements.push({ id: 'cards200', title: 'Card Master', description: 'Created 200 cards', icon: '' });
  if (stats.totalCardsReviewed >= 500) achievements.push({ id: 'reviews500', title: 'Review Master', description: 'Reviewed 500 cards', icon: '' });
  
  return achievements;
};

// Get next milestone
export const getNextMilestone = (levelData, stats) => {
  const milestones = [
    { type: 'level', value: levelData.level + 1, description: `Reach level ${levelData.level + 1}` },
    { type: 'streak', value: Math.ceil(stats.currentStreak / 7) * 7, description: `${Math.ceil(stats.currentStreak / 7) * 7}-day streak` },
    { type: 'studyTime', value: Math.ceil(stats.totalStudyTime / 100) * 100, description: `${Math.ceil(stats.totalStudyTime / 100) * 100} minutes studied` },
    { type: 'cards', value: Math.ceil(stats.totalCardsCreated / 25) * 25, description: `${Math.ceil(stats.totalCardsCreated / 25) * 25} cards created` }
  ];
  
  return milestones[0]; // Return the closest milestone
};
