// firebaseService.js
import { 
  db, 
  auth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from '../firebase';

import { 
  collection, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  serverTimestamp, 
  getDoc 
} from 'firebase/firestore';

// Authentication functions
export const registerUser = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error("Error registering user:", error);
    throw error;
  }
};

export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    console.error("Error logging in:", error);
    throw error;
  }
};

export const logoutUser = async () => {
  try {
    await signOut(auth);
    return true;
  } catch (error) {
    console.error("Error logging out:", error);
    throw error;
  }
};

export const getCurrentUser = () => {
  return new Promise((resolve, reject) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    }, reject);
  });
};

// Firestore CRUD operations
export const saveDocument = async (collectionName, data) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      userId: user.uid,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    // Get the newly created document to return with server timestamp
    const newDoc = await getDoc(docRef);
    return { id: docRef.id, ...newDoc.data() };
  } catch (error) {
    console.error(`Error saving to ${collectionName}:`, error);
    throw error;
  }
};

export const updateDocument = async (collectionName, id, updates) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    const docRef = doc(db, collectionName, id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
    
    // Get the updated document to return
    const updatedDoc = await getDoc(docRef);
    return { id, ...updatedDoc.data() };
  } catch (error) {
    console.error(`Error updating document in ${collectionName}:`, error);
    throw error;
  }
};

export const deleteDocument = async (collectionName, id) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    await deleteDoc(doc(db, collectionName, id));
    return id;
  } catch (error) {
    console.error(`Error deleting document from ${collectionName}:`, error);
    throw error;
  }
};

export const getDocuments = async (collectionName) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    const q = query(
      collection(db, collectionName),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error(`Error getting documents from ${collectionName}:`, error);
    throw error;
  }
};

// Specific collection functions for your app
export const getFlashcards = () => getDocuments('flashcards');
export const saveFlashcard = (data) => saveDocument('flashcards', data);
export const updateFlashcard = (id, updates) => updateDocument('flashcards', id, updates);
export const deleteFlashcard = (id) => deleteDocument('flashcards', id);

export const getStudyLogs = () => getDocuments('studyLogs');
export const saveStudyLog = (data) => saveDocument('studyLogs', data);
export const updateStudyLog = (id, updates) => updateDocument('studyLogs', id, updates);
export const deleteStudyLog = (id) => deleteDocument('studyLogs', id);

export const getBlurts = () => getDocuments('blurts');
export const saveBlurt = (data) => saveDocument('blurts', data);
export const updateBlurt = (id, updates) => updateDocument('blurts', id, updates);
export const deleteBlurt = (id) => deleteDocument('blurts', id);

// Concept Explanations
export const getConceptExplanations = () => getDocuments('conceptExplanations');
export const saveConceptExplanation = (data) => saveDocument('conceptExplanations', data);
export const updateConceptExplanation = (id, updates) => updateDocument('conceptExplanations', id, updates);
export const deleteConceptExplanation = (id) => deleteDocument('conceptExplanations', id);

// User Progress & Stats
export const getUserProgress = () => getDocuments('userProgress');
export const saveUserProgress = (data) => saveDocument('userProgress', data);
export const updateUserProgress = (id, updates) => updateDocument('userProgress', id, updates);
export const deleteUserProgress = (id) => deleteDocument('userProgress', id);

// Achievements
export const getAchievements = () => getDocuments('achievements');
export const saveAchievement = (data) => saveDocument('achievements', data);
export const updateAchievement = (id, updates) => updateDocument('achievements', id, updates);
export const deleteAchievement = (id) => deleteDocument('achievements', id);

// Customizations
export const getCustomizations = () => getDocuments('customizations');
export const saveCustomization = (data) => saveDocument('customizations', data);
export const updateCustomization = (id, updates) => updateDocument('customizations', id, updates);
export const deleteCustomization = (id) => deleteDocument('customizations', id);