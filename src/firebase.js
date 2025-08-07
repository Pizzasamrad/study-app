// firebase.js
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDLSITAlFNU7CBSsQZye96jJVwDSKQbsCc",
  authDomain: "studytracker-31feb.firebaseapp.com",
  projectId: "studytracker-31feb",
  storageBucket: "studytracker-31feb.firebasestorage.app",
  messagingSenderId: "276182155455",
  appId: "1:276182155455:web:6f1a7646d54f128df9c60a",
  measurementId: "G-LEBVEJXXYX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

// 🔥 CHANGE THIS LINE:
// From: export default db;
// To: export { db };

export { db };