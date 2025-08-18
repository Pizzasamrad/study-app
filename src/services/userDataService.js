// userDataService.js
import * as storageService from './storageService';
import { calculateLevel, getLevelStats } from './levelService';

// Save user progress and stats
export const saveUserProgress = async (userStats, user = null) => {
  try {
    const progressData = {
      ...userStats,
      timestamp: new Date().toISOString(),
      levelData: calculateLevel(userStats.totalXP || 0)
    };
    
    return await storageService.saveUserProgress(progressData);
  } catch (error) {
    console.error('Error saving user progress:', error);
    throw error;
  }
};

// Save user achievements
export const saveUserAchievements = async (achievements, user = null) => {
  try {
    const achievementsData = {
      achievements: achievements,
      timestamp: new Date().toISOString()
    };
    
    return await storageService.saveAchievement(achievementsData);
  } catch (error) {
    console.error('Error saving user achievements:', error);
    throw error;
  }
};

// Save user customizations
export const saveUserCustomizations = async (customizations, user = null) => {
  try {
    const customizationsData = {
      ...customizations,
      timestamp: new Date().toISOString()
    };
    
    return await storageService.saveCustomization(customizationsData);
  } catch (error) {
    console.error('Error saving user customizations:', error);
    throw error;
  }
};

// Load user progress
export const loadUserProgress = async () => {
  try {
    const progress = await storageService.getUserProgress();
    return progress.length > 0 ? progress[0] : null;
  } catch (error) {
    console.error('Error loading user progress:', error);
    return null;
  }
};

// Load user achievements
export const loadUserAchievements = async () => {
  try {
    const achievements = await storageService.getAchievements();
    return achievements.length > 0 ? achievements[0] : null;
  } catch (error) {
    console.error('Error loading user achievements:', error);
    return null;
  }
};

// Load user customizations
export const loadUserCustomizations = async () => {
  try {
    const customizations = await storageService.getCustomizations();
    return customizations.length > 0 ? customizations[0] : null;
  } catch (error) {
    console.error('Error loading user customizations:', error);
    return null;
  }
};

// Update user stats after study session
export const updateUserStats = async (sessionData, currentStats = {}) => {
  try {
    const updatedStats = {
      totalStudyTime: (currentStats.totalStudyTime || 0) + (sessionData.duration || 0),
      totalSessions: (currentStats.totalSessions || 0) + 1,
      totalCardsReviewed: (currentStats.totalCardsReviewed || 0) + (sessionData.total || 0),
      totalCardsCreated: currentStats.totalCardsCreated || 0,
      currentStreak: currentStats.currentStreak || 0,
      longestStreak: currentStats.longestStreak || 0,
      totalXP: (currentStats.totalXP || 0) + (sessionData.xpEarned || 0),
      lastStudyDate: new Date().toISOString()
    };
    
    return await saveUserProgress(updatedStats);
  } catch (error) {
    console.error('Error updating user stats:', error);
    throw error;
  }
};
