// storageService.js
import * as firebaseService from './firebaseService';

// Storage modes
export const STORAGE_MODES = {
  LOCAL: 'local',
  CLOUD: 'cloud'
};

// Default to local storage if not authenticated
let currentMode = STORAGE_MODES.LOCAL;

// Function to set storage mode
export const setStorageMode = (mode) => {
  if (Object.values(STORAGE_MODES).includes(mode)) {
    currentMode = mode;
    localStorage.setItem('studyapp-storage-mode', mode);
    return true;
  }
  return false;
};

// Initialize storage mode from localStorage
export const initStorageMode = async () => {
  const savedMode = localStorage.getItem('studyapp-storage-mode');
  
  if (savedMode && Object.values(STORAGE_MODES).includes(savedMode)) {
    currentMode = savedMode;
  }
  
  // If cloud mode is selected, check if user is authenticated
  if (currentMode === STORAGE_MODES.CLOUD) {
    try {
      const user = await firebaseService.getCurrentUser();
      if (!user) {
        // Fall back to local storage if not authenticated
        currentMode = STORAGE_MODES.LOCAL;
        localStorage.setItem('studyapp-storage-mode', STORAGE_MODES.LOCAL);
      }
    } catch (error) {
      console.error("Error checking authentication:", error);
      currentMode = STORAGE_MODES.LOCAL;
      localStorage.setItem('studyapp-storage-mode', STORAGE_MODES.LOCAL);
    }
  }
  
  return currentMode;
};

// Get current storage mode
export const getStorageMode = () => currentMode;

// Generate device ID for local storage
const getDeviceId = () => {
  let deviceId = localStorage.getItem('studyapp-device-id');
  if (!deviceId) {
    deviceId = 'device-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    localStorage.setItem('studyapp-device-id', deviceId);
  }
  return deviceId;
};

const deviceId = getDeviceId();

// Local storage operations
const localStorageService = {
  saveToStorage: (collection, data) => {
    const key = `${deviceId}-${collection}`;
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    const newItem = { 
      ...data, 
      id: Date.now().toString(), 
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const newData = [...existing, newItem];
    localStorage.setItem(key, JSON.stringify(newData));
    return newItem;
  },

  loadFromStorage: (collection) => {
    const key = `${deviceId}-${collection}`;
    return JSON.parse(localStorage.getItem(key) || '[]');
  },

  updateInStorage: (collection, id, updates) => {
    const key = `${deviceId}-${collection}`;
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    const updatedItem = { 
      ...existing.find(item => item.id === id), 
      ...updates, 
      updatedAt: new Date().toISOString() 
    };
    const updated = existing.map(item => 
      item.id === id ? updatedItem : item
    );
    localStorage.setItem(key, JSON.stringify(updated));
    return updatedItem;
  },

  deleteFromStorage: (collection, id) => {
    const key = `${deviceId}-${collection}`;
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    const filtered = existing.filter(item => item.id !== id);
    localStorage.setItem(key, JSON.stringify(filtered));
    return id;
  }
};

// Unified storage API
export const saveItem = async (collection, data) => {
  try {
    if (currentMode === STORAGE_MODES.CLOUD) {
      return await firebaseService.saveDocument(collection, data);
    } else {
      return localStorageService.saveToStorage(collection, data);
    }
  } catch (error) {
    console.error(`Error saving to ${collection}:`, error);
    // Fall back to local storage if cloud fails
    return localStorageService.saveToStorage(collection, data);
  }
};

export const getItems = async (collection) => {
  try {
    if (currentMode === STORAGE_MODES.CLOUD) {
      return await firebaseService.getDocuments(collection);
    } else {
      return localStorageService.loadFromStorage(collection);
    }
  } catch (error) {
    console.error(`Error getting items from ${collection}:`, error);
    // Fall back to local storage if cloud fails
    return localStorageService.loadFromStorage(collection);
  }
};

export const updateItem = async (collection, id, updates) => {
  try {
    if (currentMode === STORAGE_MODES.CLOUD) {
      return await firebaseService.updateDocument(collection, id, updates);
    } else {
      return localStorageService.updateInStorage(collection, id, updates);
    }
  } catch (error) {
    console.error(`Error updating item in ${collection}:`, error);
    // Fall back to local storage if cloud fails
    return localStorageService.updateInStorage(collection, id, updates);
  }
};

export const deleteItem = async (collection, id) => {
  try {
    if (currentMode === STORAGE_MODES.CLOUD) {
      return await firebaseService.deleteDocument(collection, id);
    } else {
      return localStorageService.deleteFromStorage(collection, id);
    }
  } catch (error) {
    console.error(`Error deleting item from ${collection}:`, error);
    // Fall back to local storage if cloud fails
    return localStorageService.deleteFromStorage(collection, id);
  }
};

// Specific collection functions
export const getFlashcards = () => getItems('flashcards');
export const saveFlashcard = (data) => saveItem('flashcards', data);
export const updateFlashcard = (id, updates) => updateItem('flashcards', id, updates);
export const deleteFlashcard = (id) => deleteItem('flashcards', id);

export const getStudyLogs = () => getItems('studyLogs');
export const saveStudyLog = (data) => saveItem('studyLogs', data);
export const updateStudyLog = (id, updates) => updateItem('studyLogs', id, updates);
export const deleteStudyLog = (id) => deleteItem('studyLogs', id);

export const getBlurts = () => getItems('blurts');
export const saveBlurt = (data) => saveItem('blurts', data);
export const updateBlurt = (id, updates) => updateItem('blurts', id, updates);
export const deleteBlurt = (id) => deleteItem('blurts', id);

// Concept Explanations
export const getConceptExplanations = () => getItems('conceptExplanations');
export const saveConceptExplanation = (data) => saveItem('conceptExplanations', data);
export const updateConceptExplanation = (id, updates) => updateItem('conceptExplanations', id, updates);
export const deleteConceptExplanation = (id) => deleteItem('conceptExplanations', id);

// User Progress & Stats
export const getUserProgress = () => getItems('userProgress');
export const saveUserProgress = (data) => saveItem('userProgress', data);
export const updateUserProgress = (id, updates) => updateItem('userProgress', id, updates);
export const deleteUserProgress = (id) => deleteItem('userProgress', id);

// Achievements
export const getAchievements = () => getItems('achievements');
export const saveAchievement = (data) => saveItem('achievements', data);
export const updateAchievement = (id, updates) => updateItem('achievements', id, updates);
export const deleteAchievement = (id) => deleteItem('achievements', id);

// Customizations
export const getCustomizations = () => getItems('customizations');
export const saveCustomization = (data) => saveItem('customizations', data);
export const updateCustomization = (id, updates) => updateItem('customizations', id, updates);
export const deleteCustomization = (id) => deleteItem('customizations', id);

// Data migration functions
export const migrateLocalToCloud = async () => {
  try {
    // Check if user is authenticated
    const user = await firebaseService.getCurrentUser();
    if (!user) throw new Error("User not authenticated");
    
    // Get all local data
    const localFlashcards = localStorageService.loadFromStorage('flashcards');
    const localStudyLogs = localStorageService.loadFromStorage('studyLogs');
    const localBlurts = localStorageService.loadFromStorage('blurts');
    const localConceptExplanations = localStorageService.loadFromStorage('conceptExplanations');
    const localUserProgress = localStorageService.loadFromStorage('userProgress');
    const localAchievements = localStorageService.loadFromStorage('achievements');
    const localCustomizations = localStorageService.loadFromStorage('customizations');
    
    // Upload to cloud
    const uploadPromises = [
      ...localFlashcards.map(card => firebaseService.saveFlashcard(card)),
      ...localStudyLogs.map(log => firebaseService.saveStudyLog(log)),
      ...localBlurts.map(blurt => firebaseService.saveBlurt(blurt)),
      ...localConceptExplanations.map(explanation => firebaseService.saveConceptExplanation(explanation)),
      ...localUserProgress.map(progress => firebaseService.saveUserProgress(progress)),
      ...localAchievements.map(achievement => firebaseService.saveAchievement(achievement)),
      ...localCustomizations.map(customization => firebaseService.saveCustomization(customization))
    ];
    
    await Promise.all(uploadPromises);
    
    return {
      flashcards: localFlashcards.length,
      studyLogs: localStudyLogs.length,
      blurts: localBlurts.length,
      conceptExplanations: localConceptExplanations.length,
      userProgress: localUserProgress.length,
      achievements: localAchievements.length,
      customizations: localCustomizations.length
    };
  } catch (error) {
    console.error("Error migrating data to cloud:", error);
    throw error;
  }
};