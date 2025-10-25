import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Brain, Plus, Play, Pause, RotateCcw, Save, Edit3, Trash2, Search, Star, Calendar, Trophy, Award, Flame } from 'lucide-react';
import { auth, onAuthStateChanged } from './firebase';
import AuthModal from './components/Auth/AuthModal';

import SmartAnalytics from './components/Analytics/SmartAnalytics';
import CustomizationTab from './components/Customization/CustomizationTab';
import DevTestPanel from './components/DevTools/DevTestPanel';
import Header from './components/Common/Header';
import Navigation from './components/Common/Navigation';
import DashboardTab from './components/Dashboard/DashboardTab';
import * as storageService from './services/storageService';
import { getBackgroundClasses } from './services/customizationService';
import * as userDataService from './services/userDataService';
import './animations.css';

const StudyApp = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [flashcards, setFlashcards] = useState([]);
  const [studyLogs, setStudyLogs] = useState([]);
  const [pomodoroTime, setPomodoroTime] = useState(25 * 60);
  const [customInterval, setCustomInterval] = useState(25);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [blurts, setBlurts] = useState([]);
  
  // 🔥 NEW: Celebration state
  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationData, setCelebrationData] = useState(null);
  
  // 🔥 NEW: Authentication state
  const [user, setUser] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [storageMode, setStorageModeState] = useState(storageService.STORAGE_MODES.LOCAL);
  
  
  // Customization state
  const [selectedCustomizations, setSelectedCustomizations] = useState({
          avatars: 'default',
      backgrounds: 'default'
  });

  // Dev testing state (for quick testing)
  const [devLevel, setDevLevel] = useState(1);
  const [devAchievements, setDevAchievements] = useState([]);
  const [devStats, setDevStats] = useState({
    totalStudyTime: 0,
    totalCardsCreated: 0,
    totalCardsReviewed: 0,
    currentStreak: 0,
    longestStreak: 0
  });

  // Initialize storage mode and auth state
  useEffect(() => {
    const initApp = async () => {
      setIsLoading(true);
      
      // Initialize storage mode
      const mode = await storageService.initStorageMode();
      setStorageModeState(mode);
      
      // Request notification permission for timer alerts
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
      }
      
      // Set up auth state listener
      const unsubscribe = onAuthStateChanged(auth, (user) => {
        setUser(user);
        setIsLoading(false);
      });
      
      return unsubscribe;
    };
    
    initApp();
  }, []);

  // Handle logout
  const handleLogout = async () => {
    try {
      await auth.signOut();
      setUser(null);
      setStorageModeState(storageService.getStorageMode());
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  // 🔥 NEW: Calculate study streak with milestone detection
  const calculateStreak = useCallback((logs) => {
    if (logs.length === 0) return { current: 0, milestone: null };

    const sortedLogs = logs.sort((a, b) => new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date));
    let currentStreak = 0;
    let lastDate = new Date().toDateString();
    
    // Check if we studied today
    const hasStudiedToday = sortedLogs.some(log => {
      const logDate = new Date(log.createdAt || Date.now()).toDateString();
      return logDate === new Date().toDateString();
    });
    
    if (hasStudiedToday) currentStreak = 1;
    
    for (const log of sortedLogs) {
      const logDate = new Date(log.createdAt || Date.now()).toDateString();
      if (logDate !== lastDate) {
        const daysDiff = Math.floor((new Date(lastDate) - new Date(logDate)) / (1000 * 60 * 60 * 24));
        if (daysDiff === 1) {
          currentStreak++;
          lastDate = logDate;
        } else if (daysDiff > 1) {
          break;
        }
      }
    }

    // Check for milestone achievements
    const milestones = [3, 7, 14, 30, 50, 100];
    let milestone = null;
    
    for (const m of milestones) {
      if (currentStreak === m) {
        milestone = m;
        break;
      }
    }

    return { current: currentStreak, milestone };
  }, []);

  // 🔥 NEW: Trigger celebration
  const triggerCelebration = useCallback((type, data) => {
    setCelebrationData({ type, ...data });
    setShowCelebration(true);
    
    // Auto-hide after 4 seconds
    setTimeout(() => {
      setShowCelebration(false);
    }, 4000);
  }, []);

  // Load data when storage mode changes or on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const [
          cards, 
          logs, 
          blurtData,
          userProgress,
          achievements,
          customizations
        ] = await Promise.all([
          storageService.getFlashcards(),
          storageService.getStudyLogs(),
          storageService.getBlurts(),
          userDataService.loadUserProgress(),
          userDataService.loadUserAchievements(),
          userDataService.loadUserCustomizations()
        ]);
        
        setFlashcards(cards);
        setStudyLogs(logs);
        setBlurts(blurtData);
        
        // Load user progress and stats
        if (userProgress) {
          setDevStats(userProgress);
        }
        
        // Load achievements
        if (achievements) {
          setDevAchievements(achievements.achievements || []);
        }
        
        // Load customizations
        if (customizations) {
          setSelectedCustomizations(customizations);
        }
      } catch (error) {
        console.error("Error loading data:", error);
      }
    };
    
    if (!isLoading) {
      loadData();
    }
  }, [isLoading, storageMode]);

  // Pomodoro Timer Logic - Fixed for tab switching
  const [timerStartTime, setTimerStartTime] = useState(null);
  const [timerInitialDuration, setTimerInitialDuration] = useState(0);

  // Helper function to handle timer completion
  const handleTimerComplete = useCallback(() => {
    setIsTimerActive(false);
    setTimerStartTime(null);
    setTimerInitialDuration(0);
    
    // Show notification even if tab is not active
    if (Notification.permission === 'granted') {
      new Notification('Pomodoro Complete!', {
        body: 'Your study session is complete! Time to take a break.',
        icon: '/favicon.ico',
        requireInteraction: true
      });
    } else {
      alert('Pomodoro session complete! Take a break.');
    }
    
    setPomodoroTime(customInterval * 60);
  }, [customInterval]);

  // Handle page visibility changes to ensure accurate timing
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (isTimerActive && timerStartTime && timerInitialDuration > 0) {
        // Recalculate time when tab becomes visible again
        const now = Date.now();
        const elapsedSeconds = Math.floor((now - timerStartTime) / 1000);
        const remainingTime = Math.max(0, timerInitialDuration - elapsedSeconds);
        setPomodoroTime(remainingTime);
        
        if (remainingTime <= 0) {
          handleTimerComplete();
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [isTimerActive, timerStartTime, timerInitialDuration, customInterval, handleTimerComplete]);

  useEffect(() => {
    let interval = null;
    
    if (isTimerActive && pomodoroTime > 0) {
      // Store the start time and initial duration when timer starts
      if (!timerStartTime) {
        setTimerStartTime(Date.now());
        setTimerInitialDuration(pomodoroTime);
      }
      
      interval = setInterval(() => {
        const now = Date.now();
        const elapsedSeconds = Math.floor((now - timerStartTime) / 1000);
        const remainingTime = Math.max(0, timerInitialDuration - elapsedSeconds);
        
        setPomodoroTime(remainingTime);
        
        if (remainingTime <= 0) {
          handleTimerComplete();
        }
      }, 1000);
    } else if (!isTimerActive) {
      // Reset timer state when stopped
      setTimerStartTime(null);
      setTimerInitialDuration(0);
    }
    
    return () => clearInterval(interval);
  }, [isTimerActive, timerStartTime, timerInitialDuration, customInterval, handleTimerComplete]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const resetTimer = () => {
    setIsTimerActive(false);
    setPomodoroTime(customInterval * 60);
    setTimerStartTime(null);
    setTimerInitialDuration(0);
  };

  // 🚀 NEW: Simple Category-based Study System
  const getCardsByCategory = (category) => {
    if (category === 'all') {
      return flashcards;
    }
    return flashcards.filter(card => card.subject === category);
  };

  const getAvailableCategories = () => {
    const categories = ['all', ...new Set(flashcards.map(card => card.subject))];
    return categories;
  };

  // 🚀 Enhanced Flashcard Management with Celebrations and Cloud Sync
  const addFlashcard = async (front, back, subject, highlightedWords = []) => {
    try {
      const newCard = {
        front,
        back,
        subject,
        displayDate: new Date().toLocaleDateString(),
        reviewCount: 0,
        lastReviewed: null,
        highlightedWords: highlightedWords || [] // Store words to be blanked out in cloze deletion
      };
      
      const savedCard = await storageService.saveFlashcard(newCard);
      
      // Update local state with the new card
      setFlashcards(prev => [...prev, savedCard]);
      
      // Celebrate first flashcard or milestone
      if (flashcards.length === 0) {
        triggerCelebration('first_card', { message: 'Your first flashcard is ready! The journey to mastery begins now!' });
      } else if ((flashcards.length + 1) % 10 === 0) {
        triggerCelebration('milestone', { 
          message: `${flashcards.length + 1} flashcards created! You're building an incredible knowledge base!`,
          count: flashcards.length + 1 
        });
      }
    } catch (error) {
      console.error('Error adding flashcard:', error);
      alert('Error saving flashcard. Please try again.');
    }
  };

  const updateFlashcard = async (id, updates) => {
    try {
      const updatedCard = await storageService.updateFlashcard(id, updates);
      
      // Update local state
      setFlashcards(prev => 
        prev.map(card => card.id === id ? { ...card, ...updatedCard } : card)
      );
    } catch (error) {
      console.error('Error updating flashcard:', error);
      alert('Error updating flashcard. Please try again.');
    }
  };

  const deleteFlashcard = async (id) => {
    try {
      await storageService.deleteFlashcard(id);
      
      // Update local state
      setFlashcards(prev => prev.filter(card => card.id !== id));
    } catch (error) {
      console.error('Error deleting flashcard:', error);
      alert('Error deleting flashcard. Please try again.');
    }
  };

  // 🚀 Simple flashcard review with celebrations
  const reviewFlashcard = async (id, difficulty) => {
    const card = flashcards.find(c => c.id === id);
    if (!card) return;

    const updates = {
      difficulty,
      reviewCount: (card.reviewCount || 0) + 1,
      lastReviewed: new Date().toISOString()
    };

    await updateFlashcard(id, updates);
    
    // Celebrate review milestones
    const newReviewCount = (card.reviewCount || 0) + 1;
    if (newReviewCount === 1) {
      triggerCelebration('first_review', { message: 'First review completed! Your brain is already getting stronger!' });
    } else if (newReviewCount === 10) {
      triggerCelebration('review_master', { message: '10 reviews on this card - you\'re a memory master!' });
    }
  };

  const addStudyLog = async (subject, duration, notes) => {
    try {
      const newLog = {
        subject,
        duration,
        notes,
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString()
      };
      
      const savedLog = await storageService.saveStudyLog(newLog);
      
      // Update local state
      setStudyLogs(prev => [...prev, savedLog]);
      
      // Check for streak milestones with updated logs
      const updatedLogs = [...studyLogs, savedLog];
      const streakData = calculateStreak(updatedLogs);
      
      if (streakData.milestone) {
        const messages = {
          3: '3-day streak! You\'re building momentum!',
          7: '7-day streak! You\'re on fire!',
          14: '14-day streak! Unstoppable!',
          30: '30-day streak! Legend status!',
          50: '50-day streak! Royalty!',
          100: '100-day streak! Immortal!'
        };
        
        triggerCelebration('streak_milestone', {
          message: messages[streakData.milestone],
          streak: streakData.milestone
        });
      }
    } catch (error) {
      console.error('Error adding study log:', error);
      alert('Error saving study log. Please try again.');
    }
  };


  const handleCustomizationChange = async (type, customizationId) => {
    const newCustomizations = {
      ...selectedCustomizations,
      [type]: customizationId
    };
    
    setSelectedCustomizations(newCustomizations);
    
    // Save customizations
    try {
      await userDataService.saveUserCustomizations(newCustomizations);
    } catch (error) {
      console.error('Error saving customizations:', error);
    }
  };

  const setCustomTimer = (minutes) => {
    setCustomInterval(minutes);
    setIsTimerActive(false);
    setPomodoroTime(minutes * 60);
    setTimerStartTime(null);
    setTimerInitialDuration(0);
  };

  const addBlurt = async (content, subject) => {
    try {
      const newBlurt = {
        content,
        subject,
        timestamp: new Date().toLocaleString()
      };
      
      const savedBlurt = await storageService.saveBlurt(newBlurt);
      
      // Update local state
      setBlurts(prev => [...prev, savedBlurt]);
    } catch (error) {
      console.error('Error adding blurt:', error);
      alert('Error saving brain blurt. Please try again.');
    }
  };

  const deleteBlurt = async (id) => {
    try {
      await storageService.deleteBlurt(id);
      
      // Update local state
      setBlurts(prev => prev.filter(blurt => blurt.id !== id));
    } catch (error) {
      console.error('Error deleting blurt:', error);
      alert('Error deleting brain blurt. Please try again.');
    }
  };

  const availableCategories = useMemo(() => getAvailableCategories(), [flashcards]);



  // 🔥 NEW: Celebration Modal Component
  const CelebrationModal = ({ show, data, onClose }) => {
    if (!show || !data) return null;

    const getIcon = () => {
      switch (data.type) {
        case 'streak': return <Flame className="text-orange-500" size={48} />;
        case 'first_card': return <Brain className="text-blue-500" size={48} />;
        case 'milestone': return <Trophy className="text-yellow-500" size={48} />;
        case 'first_review': return <Star className="text-purple-500" size={48} />;
        case 'review_master': return <Award className="text-green-500" size={48} />;
        default: return <Trophy className="text-yellow-500" size={48} />;
      }
    };

    return (
      <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-lg">
        <div className="bg-gradient-to-br from-purple-900/90 to-indigo-900/90 backdrop-blur-xl rounded-3xl p-8 max-w-md mx-4 text-center shadow-2xl border border-white/20 transform transition-all duration-500 animate-float">
          {/* Celebration particles */}
          <div className="absolute inset-0 overflow-hidden rounded-3xl">
            <div className="absolute top-4 left-4 w-2 h-2 bg-yellow-400 rounded-full animate-ping"></div>
            <div className="absolute top-8 right-6 w-1 h-1 bg-pink-400 rounded-full animate-pulse"></div>
            <div className="absolute bottom-6 left-8 w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce"></div>
            <div className="absolute bottom-4 right-4 w-2 h-2 bg-green-400 rounded-full animate-ping animation-delay-2000"></div>
          </div>
          
          <div className="mb-6 flex justify-center relative z-10">
            <div className="p-6 bg-gradient-to-br from-yellow-400/20 to-orange-500/20 rounded-3xl backdrop-blur-sm border border-white/30 animate-glow">
              {getIcon()}
            </div>
          </div>
          
          <h2 className="text-3xl font-black bg-gradient-to-r from-yellow-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent mb-4 animate-gradient-x">
            🎉 Amazing! 🎉
          </h2>
          
          <p className="text-white/90 mb-8 leading-relaxed text-lg font-medium">{data.message}</p>
          
          <button
            onClick={onClose}
            className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 text-white px-10 py-4 rounded-2xl font-bold text-lg hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 transition-all duration-300 shadow-2xl hover:shadow-pink-500/50 transform hover:scale-110 hover:-translate-y-1"
          >
            ✨ Awesome! ✨
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br ${getBackgroundClasses(selectedCustomizations.backgrounds)} relative overflow-hidden`}>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-pink-400 to-purple-600 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-yellow-400 to-pink-600 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-gradient-to-br from-blue-400 to-green-600 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>
      {/* 🔥 NEW: Celebration Modal */}
      <CelebrationModal 
        show={showCelebration} 
        data={celebrationData} 
        onClose={() => setShowCelebration(false)} 
      />
      
      {/* Authentication Modal */}
      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
        onAuthSuccess={(user) => {
          setStorageModeState(storageService.getStorageMode());
          setAuthModalOpen(false);
        }} 
      />
      
      <div className="container mx-auto px-6 py-8 relative z-10">
        {/* Header */}
        <Header 
                user={user} 
          onAuthModalOpen={() => setAuthModalOpen(true)}
          onLogout={handleLogout}
          storageMode={storageMode}
          onStorageModeChange={(mode) => setStorageModeState(mode)}
          streakData={{ current: devStats.currentStreak, longest: devStats.longestStreak }}
          studyLogs={studyLogs}
          flashcards={flashcards}
          blurts={blurts}
          selectedCustomizations={selectedCustomizations}
          devLevel={devLevel}
        />



        {/* Navigation */}
        <Navigation 
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Dashboard */}
        {activeTab === 'dashboard' && (
          <DashboardTab 
            flashcards={flashcards}
            studyLogs={studyLogs}
            availableCategories={availableCategories}
            streakData={{ current: devStats.currentStreak, longest: devStats.longestStreak }}
            onTabChange={setActiveTab}
            blurts={blurts}
          />
        )}

        {/* Flashcards Tab */}
                {activeTab === 'flashcards' && (
          <FlashcardsTab
            flashcards={flashcards}
            availableCategories={availableCategories}
            onAddFlashcard={addFlashcard}
            onUpdateFlashcard={updateFlashcard}
            onDeleteFlashcard={deleteFlashcard}
            onReviewFlashcard={reviewFlashcard}
          />
        )}

        {/* Pomodoro Tab */}
        {activeTab === 'pomodoro' && (
          <PomodoroTab
            time={pomodoroTime}
            isActive={isTimerActive}
            onToggle={() => setIsTimerActive(!isTimerActive)}
            onReset={resetTimer}
            formatTime={formatTime}
            onAddStudyLog={addStudyLog}
            customInterval={customInterval}
            onSetCustomTimer={setCustomTimer}
          />
        )}


        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <SmartAnalytics studyLogs={studyLogs} flashcards={flashcards} blurts={blurts} />
        )}

        {/* Customization Tab */}
        {activeTab === 'customization' && (
          <CustomizationTab
            studyLogs={studyLogs}
            flashcards={flashcards}
            blurts={blurts}
            streakData={{ current: devStats.currentStreak, longest: devStats.longestStreak }}
            selectedCustomizations={selectedCustomizations}
            onCustomizationChange={handleCustomizationChange}
            devLevel={devLevel}
          />
        )}

        {/* Brain Blurts Tab */}
        {activeTab === 'blurts' && (
          <BlurtsTab
            blurts={blurts}
            onAddBlurt={addBlurt}
            onDeleteBlurt={deleteBlurt}
          />
        )}

        {/* Developer Testing Panel - DISABLED */}
        {/* 
        To re-enable the dev testing panel, uncomment the code below:
        
        <DevTestPanel
          onSetLevel={setDevLevel}
          onSetCustomizations={async (customizations) => {
            setSelectedCustomizations(customizations);
            try {
              await userDataService.saveUserCustomizations(customizations);
            } catch (error) {
              console.error('Error saving customizations:', error);
            }
          }}
          onSetAchievements={async (achievements) => {
            setDevAchievements(achievements);
            try {
              await userDataService.saveUserAchievements(achievements);
            } catch (error) {
              console.error('Error saving achievements:', error);
            }
          }}
          onSetStats={async (stats) => {
            setDevStats(stats);
            try {
              await userDataService.saveUserProgress(stats);
            } catch (error) {
              console.error('Error saving user stats:', error);
            }
          }}
          currentLevel={devLevel}
          selectedCustomizations={selectedCustomizations}
          achievements={devAchievements}
          stats={devStats}
        />
        */}
      </div>
    </div>
  );
};

// 🚀 ENHANCED: Flashcards Component with Category-based Study
const FlashcardsTab = ({ flashcards, availableCategories, onAddFlashcard, onUpdateFlashcard, onDeleteFlashcard, onReviewFlashcard }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [subject, setSubject] = useState('');
  const [studyMode, setStudyMode] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentCard, setCurrentCard] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [highlightedWords, setHighlightedWords] = useState([]);
  const [showHighlighting, setShowHighlighting] = useState(false);
  const [currentStudyMode, setCurrentStudyMode] = useState('flashcard'); // Default to flashcard review
  const [userAnswer, setUserAnswer] = useState('');
  const [clozeText, setClozeText] = useState('');
  const [clozeAnswer, setClozeAnswer] = useState('');

  // Get cards for the selected category
  const getCardsForCategory = (category) => {
    if (category === 'all') {
      return flashcards;
    }
    return flashcards.filter(card => card.subject === category);
  };

  const studyCards = getCardsForCategory(selectedCategory);

  // Regenerate cloze text when card changes in cloze mode
  useEffect(() => {
    if (currentStudyMode === 'cloze' && studyCards.length > 0 && currentCard < studyCards.length) {
      const card = studyCards[currentCard];
      const cloze = generateClozeDeletion(card.back, card.highlightedWords || [], card.id);
      setClozeText(cloze.text);
      setClozeAnswer(cloze.answer);
    }
  }, [currentCard, currentStudyMode, studyCards]);

  // Get unique subjects
  const subjects = ['all', ...new Set(flashcards.map(card => card.subject))];

  // Filter cards based on search and subject
  const filteredCards = flashcards.filter(card => {
    const matchesSearch = card.front.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         card.back.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = selectedSubject === 'all' || card.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  const handleWordClick = (word) => {
    const cleanWord = word.toLowerCase().replace(/[^\w]/g, '');
    if (cleanWord.length < 2) return; // Don't highlight very short words
    
    setHighlightedWords(prev => {
      if (prev.includes(cleanWord)) {
        return prev.filter(w => w !== cleanWord);
      } else {
        return [...prev, cleanWord];
      }
    });
  };

  const handleSubmit = async () => {
    if (front.trim() && back.trim()) {
      setSaving(true);
      if (editingCard) {
        await onUpdateFlashcard(editingCard.id, { 
          front, 
          back, 
          subject: subject || 'General',
          highlightedWords 
        });
        setEditingCard(null);
      } else {
        await onAddFlashcard(front, back, subject || 'General', highlightedWords);
      }
      setFront('');
      setBack('');
      setSubject('');
      setHighlightedWords([]);
      setShowHighlighting(false);
      setShowForm(false);
      setSaving(false);
    }
  };

  const startEdit = (card) => {
    setEditingCard(card);
    setFront(card.front);
    setBack(card.back);
    setSubject(card.subject);
    setShowForm(true);
  };

  const cancelEdit = () => {
    setEditingCard(null);
    setFront('');
    setBack('');
    setSubject('');
    setShowForm(false);
  };

  const nextCard = () => {
    setShowAnswer(false);
    setUserAnswer('');
    setCurrentCard((prev) => (prev + 1) % studyCards.length);
    
    // Regenerate cloze text for new card if in cloze mode
    if (currentStudyMode === 'cloze') {
      const newCard = studyCards[(currentCard + 1) % studyCards.length];
      if (newCard) {
        const cloze = generateClozeDeletion(newCard.back, newCard.highlightedWords || [], newCard.id);
        setClozeText(cloze.text);
        setClozeAnswer(cloze.answer);
      }
    }
  };

  const prevCard = () => {
    setShowAnswer(false);
    setUserAnswer('');
    setCurrentCard((prev) => (prev - 1 + studyCards.length) % studyCards.length);
    
    // Regenerate cloze text for new card if in cloze mode
    if (currentStudyMode === 'cloze') {
      const newCard = studyCards[(currentCard - 1 + studyCards.length) % studyCards.length];
      if (newCard) {
        const cloze = generateClozeDeletion(newCard.back, newCard.highlightedWords || [], newCard.id);
        setClozeText(cloze.text);
        setClozeAnswer(cloze.answer);
      }
    }
  };

  const handleReview = async (difficulty) => {
    if (currentCard >= studyCards.length || currentCard < 0) return;
    const card = studyCards[currentCard];
    if (!card) return;
    await onReviewFlashcard(card.id, difficulty);
    nextCard();
  };

  // Generate cloze deletion using highlighted words
  const generateClozeDeletion = (text, highlightedWords = [], cardId = null) => {
    if (!text || text.trim().length === 0) {
      return { text: 'No content available', answer: '' };
    }
    
    // If no highlighted words, fall back to simple cloze generation
    if (!highlightedWords || highlightedWords.length === 0) {
      const words = text.split(' ');
      const keyWords = words.filter(word => 
        word.length > 4 && !['the', 'and', 'for', 'with', 'this', 'that'].includes(word.toLowerCase())
      );
      
      if (keyWords.length === 0) {
        return { text: text, answer: 'No cloze available' };
      }
      
      // Use cardId for deterministic selection
      const seed = cardId ? cardId.split('').reduce((a, b) => a + b.charCodeAt(0), 0) : 0;
      const randomIndex = seed % keyWords.length;
      const randomWord = keyWords[randomIndex];
      const clozeText = text.replace(new RegExp(randomWord, 'gi'), '_____');
      
      return { text: clozeText, answer: randomWord };
    }
    
    // Use highlighted words for cloze deletion
    const availableWords = highlightedWords.filter(word => 
      text.toLowerCase().includes(word.toLowerCase())
    );
    
    if (availableWords.length === 0) {
      return { text: text, answer: 'No highlighted words found in text' };
    }
    
    // Find all instances of highlighted words in the text with their positions
    const wordInstances = [];
    const words = text.split(/(\s+|[.,!?;:])/); // Split by spaces and punctuation
    
    words.forEach((word, index) => {
      const cleanWord = word.toLowerCase().replace(/[^\w]/g, '');
      if (availableWords.includes(cleanWord) && cleanWord.length > 1) {
        wordInstances.push({
          word: word,
          cleanWord: cleanWord,
          index: index,
          originalWord: word
        });
      }
    });
    
    if (wordInstances.length === 0) {
      return { text: text, answer: 'No highlighted words found in text' };
    }
    
    // Use cardId for deterministic selection instead of random
    const seed = cardId ? cardId.split('').reduce((a, b) => a + b.charCodeAt(0), 0) : 0;
    const selectedIndex = seed % wordInstances.length;
    const selectedInstance = wordInstances[selectedIndex];
    
    // Replace only the specific instance, not all instances of the word
    const newWords = [...words];
    newWords[selectedInstance.index] = '_____';
    const clozeText = newWords.join('');
    
    return { text: clozeText, answer: selectedInstance.originalWord };
  };

  // Switch study mode and prepare content
  const switchStudyMode = (mode) => {
    setCurrentStudyMode(mode);
    setUserAnswer('');
    setShowAnswer(false);
    
    if (mode === 'cloze' && studyCards.length > 0 && currentCard < studyCards.length) {
      const card = studyCards[currentCard];
      if (card) {
        const cloze = generateClozeDeletion(card.back, card.highlightedWords || [], card.id);
        setClozeText(cloze.text);
        setClozeAnswer(cloze.answer);
      }
    }
  };

  // Check answer for cloze deletion
  const checkClozeAnswer = () => {
    if (!userAnswer.trim()) return;
    
    const isCorrect = userAnswer.toLowerCase().trim() === clozeAnswer.toLowerCase().trim();
    if (isCorrect) {
      // Show success feedback before moving to next card
      setShowAnswer(true);
      // Auto-advance after a short delay to show the success message
      setTimeout(() => {
        handleReview('easy');
      }, 1500);
    } else {
      setShowAnswer(true);
    }
  };

  if (studyMode && studyCards.length > 0 && currentCard < studyCards.length) {
    const card = studyCards[currentCard];
    if (!card) return null;
    
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 z-50 flex flex-col">
        {/* Header */}
        <div className="absolute top-0 left-0 right-0 bg-black/20 backdrop-blur-xl border-b border-white/10 p-6">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <button
              onClick={() => {
                setStudyMode(false);
                setCurrentCard(0);
                setShowAnswer(false);
                setCurrentStudyMode('flashcard');
                setUserAnswer('');
              }}
              className="bg-gradient-to-r from-gray-500/80 to-gray-600/80 backdrop-blur-sm text-white px-6 py-3 rounded-2xl hover:from-gray-600/90 hover:to-gray-700/90 transition-all duration-300 font-bold shadow-lg hover:shadow-gray-500/50 transform hover:scale-105 flex items-center"
            >
              ← 🏠 Exit Study
            </button>
            <div className="text-center">
              <div className="text-white font-bold text-xl">
                {currentCard + 1} of {studyCards.length}
              </div>
              <div className="text-white/80 text-sm">
                {selectedCategory === 'all' ? 'All Cards' : selectedCategory}
              </div>
            </div>
            
            {/* Study Mode Switcher */}
            <div className="flex space-x-2">
              {[
                { id: 'flashcard', name: 'Review', icon: '📚' },
                { id: 'cloze', name: 'Cloze', icon: '✏️' },
                { id: 'concept', name: 'Explain', icon: '💡' }
              ].map(mode => (
                <button
                  key={mode.id}
                  onClick={() => switchStudyMode(mode.id)}
                  className={`px-4 py-2 rounded-xl font-bold text-sm transition-all duration-300 ${
                    currentStudyMode === mode.id
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white shadow-lg'
                      : 'bg-white/10 backdrop-blur-sm text-white/80 hover:bg-white/20'
                  }`}
                >
                  <span className="mr-1">{mode.icon}</span>
                  {mode.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Study Area */}
        <div className="flex-1 flex items-center justify-center pt-20 pb-8 px-6">
          <div className="max-w-4xl w-full">
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="w-full bg-white/10 rounded-full h-3 mb-4">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-cyan-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${((currentCard + 1) / studyCards.length) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Card */}
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl border border-white/20 p-12 min-h-96 flex flex-col justify-center items-center text-center shadow-2xl relative overflow-hidden">
              {/* Background Pattern */}
              <div className="absolute inset-0 opacity-5">
                <div className="absolute top-4 left-4 w-32 h-32 bg-blue-400 rounded-full blur-3xl"></div>
                <div className="absolute bottom-4 right-4 w-24 h-24 bg-purple-400 rounded-full blur-3xl"></div>
              </div>
              
              {/* Subject Tags */}
              <div className="mb-8 flex flex-wrap items-center justify-center gap-3 relative z-10">
                <span className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-4 py-2 rounded-full font-bold">
                  {card.subject}
                </span>
                {card.reviewCount > 0 && (
                  <span className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-full font-bold">
                    Reviewed {card.reviewCount} times
                  </span>
                )}
              </div>
              
              {/* Study Mode Content */}
              {currentStudyMode === 'flashcard' && (
                <>
                  {/* Card Content */}
                  <div className="text-3xl font-bold text-white mb-12 min-h-32 flex items-center justify-center leading-relaxed max-w-3xl relative z-10">
                    {showAnswer ? card.back : card.front}
                  </div>

                  {/* Action Buttons */}
                  {!showAnswer ? (
                    <button
                      onClick={() => setShowAnswer(true)}
                      className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-12 py-6 rounded-2xl hover:from-blue-600 hover:to-cyan-700 transition-all duration-300 font-bold text-xl shadow-2xl hover:shadow-blue-500/50 transform hover:scale-105 relative z-10"
                    >
                      Show Answer
                    </button>
                  ) : (
                    <div className="space-y-8 relative z-10">
                      <p className="text-white/90 mb-8 text-xl font-medium">How well did you remember this?</p>
                      <div className="flex flex-col sm:flex-row gap-6 mb-8">
                        <button 
                          onClick={() => handleReview('hard')}
                          className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-10 py-6 rounded-2xl hover:from-red-600 hover:to-pink-700 transition-all duration-300 font-bold text-lg shadow-2xl hover:shadow-red-500/50 transform hover:scale-105"
                        >
                          😰 Hard
                        </button>
                        <button 
                          onClick={() => handleReview('medium')}
                          className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white px-10 py-6 rounded-2xl hover:from-yellow-600 hover:to-orange-700 transition-all duration-300 font-bold text-lg shadow-2xl hover:shadow-yellow-500/50 transform hover:scale-105"
                        >
                          😐 Medium
                        </button>
                        <button 
                          onClick={() => handleReview('easy')}
                          className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-10 py-6 rounded-2xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 font-bold text-lg shadow-2xl hover:shadow-green-500/50 transform hover:scale-105"
                        >
                          😊 Easy
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}

              {currentStudyMode === 'cloze' && (
                <>
                  {/* Cloze Deletion Content */}
                  <div className="text-3xl font-bold text-white mb-8 min-h-32 flex items-center justify-center leading-relaxed max-w-3xl relative z-10">
                    {clozeText || card.back}
                  </div>
                  
                  {/* Cloze Deletion Info */}
                  <div className="bg-blue-500/20 border border-blue-400/30 rounded-lg p-4 mb-6 max-w-2xl mx-auto">
                    <div className="text-blue-200 text-sm font-medium mb-1">💡 Cloze Deletion Tip:</div>
                    <div className="text-blue-100 text-xs">
                      This card has {card.highlightedWords?.length || 0} highlighted words. 
                      One word is randomly selected to be blanked out each time you study this card.
                    </div>
                  </div>

                  {!showAnswer ? (
                    <div className="space-y-6 relative z-10">
                      <div className="max-w-2xl mx-auto">
                        <input
                          type="text"
                          value={userAnswer}
                          onChange={(e) => setUserAnswer(e.target.value)}
                          placeholder="Fill in the blank..."
                          className="w-full p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent font-medium text-xl text-center"
                          onKeyPress={(e) => e.key === 'Enter' && checkClozeAnswer()}
                        />
                      </div>
                      <button
                        onClick={checkClozeAnswer}
                        className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-12 py-4 rounded-2xl hover:from-blue-600 hover:to-cyan-700 transition-all duration-300 font-bold text-lg shadow-2xl hover:shadow-blue-500/50 transform hover:scale-105"
                      >
                        Check Answer
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-8 relative z-10">
                      {userAnswer.toLowerCase().trim() === clozeAnswer.toLowerCase().trim() ? (
                        <div className="text-center">
                          <div className="text-6xl mb-4">🎉</div>
                          <div className="text-3xl font-bold text-green-400 mb-2">Correct!</div>
                          <div className="text-xl text-white/80">Great job! You got it right!</div>
                        </div>
                      ) : (
                        <div className="text-center">
                          <div className="text-6xl mb-4">💭</div>
                          <div className="text-3xl font-bold text-red-400 mb-2">Not quite right</div>
                          <div className="text-xl text-white/80 mb-4">Your answer: <span className="text-red-300">{userAnswer}</span></div>
                          <div className="text-xl text-white/80">Correct answer: <span className="text-yellow-400 font-bold">{clozeAnswer}</span></div>
                        </div>
                      )}
                      <div className="flex flex-col sm:flex-row gap-6 mb-8">
                        <button 
                          onClick={() => handleReview('hard')}
                          className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-10 py-6 rounded-2xl hover:from-red-600 hover:to-pink-700 transition-all duration-300 font-bold text-lg shadow-2xl hover:shadow-red-500/50 transform hover:scale-105"
                        >
                          😰 Hard
                        </button>
                        <button 
                          onClick={() => handleReview('medium')}
                          className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white px-10 py-6 rounded-2xl hover:from-yellow-600 hover:to-orange-700 transition-all duration-300 font-bold text-lg shadow-2xl hover:shadow-yellow-500/50 transform hover:scale-105"
                        >
                          😐 Medium
                        </button>
                        <button 
                          onClick={() => handleReview('easy')}
                          className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-10 py-6 rounded-2xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 font-bold text-lg shadow-2xl hover:shadow-green-500/50 transform hover:scale-105"
                        >
                          😊 Easy
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}

              {currentStudyMode === 'concept' && (
                <>
                  {/* Concept Explanation Content */}
                  <div className="text-3xl font-bold text-white mb-8 min-h-32 flex items-center justify-center leading-relaxed max-w-3xl relative z-10">
                    {card.front}
                  </div>

                  <div className="space-y-6 relative z-10">
                    <div className="max-w-2xl mx-auto">
                      <textarea
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        placeholder="Explain why this answer is correct..."
                        className="w-full p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent font-medium text-lg resize-none"
                        rows="4"
                      />
                    </div>
                    <button
                      onClick={() => setShowAnswer(true)}
                      className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-12 py-4 rounded-2xl hover:from-purple-600 hover:to-pink-700 transition-all duration-300 font-bold text-lg shadow-2xl hover:shadow-purple-500/50 transform hover:scale-105"
                    >
                      Show Answer
                    </button>
                  </div>

                  {showAnswer && (
                    <div className="space-y-8 relative z-10 mt-8">
                      <div className="text-2xl font-bold text-white mb-4">Correct Answer:</div>
                      <div className="text-xl text-white/90 mb-8">{card.back}</div>
                      <div className="flex flex-col sm:flex-row gap-6 mb-8">
                        <button 
                          onClick={() => handleReview('hard')}
                          className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-10 py-6 rounded-2xl hover:from-red-600 hover:to-pink-700 transition-all duration-300 font-bold text-lg shadow-2xl hover:shadow-red-500/50 transform hover:scale-105"
                        >
                          😰 Hard
                        </button>
                        <button 
                          onClick={() => handleReview('medium')}
                          className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white px-10 py-6 rounded-2xl hover:from-yellow-600 hover:to-orange-700 transition-all duration-300 font-bold text-lg shadow-2xl hover:shadow-yellow-500/50 transform hover:scale-105"
                        >
                          😐 Medium
                        </button>
                        <button 
                          onClick={() => handleReview('easy')}
                          className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-10 py-6 rounded-2xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 font-bold text-lg shadow-2xl hover:shadow-green-500/50 transform hover:scale-105"
                        >
                          😊 Easy
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Navigation */}
              <div className="flex flex-col sm:flex-row gap-4 mt-12 relative z-10">
                <button 
                  onClick={prevCard} 
                  className="bg-gradient-to-r from-gray-500/80 to-gray-600/80 backdrop-blur-sm text-white px-8 py-4 rounded-2xl hover:from-gray-600/90 hover:to-gray-700/90 transition-all duration-300 font-bold shadow-lg hover:shadow-gray-500/50 transform hover:scale-105"
                >
                  ← Previous
                </button>
                <button 
                  onClick={nextCard} 
                  className="bg-gradient-to-r from-gray-500/80 to-gray-600/80 backdrop-blur-sm text-white px-8 py-4 rounded-2xl hover:from-gray-600/90 hover:to-gray-700/90 transition-all duration-300 font-bold shadow-lg hover:shadow-gray-500/50 transform hover:scale-105"
                >
                  Next →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-purple-500/20 to-indigo-600/20 backdrop-blur-xl rounded-3xl border border-white/20 p-8 shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-6 lg:space-y-0">
          <div>
            <h2 className="text-4xl font-black text-white mb-2 flex items-center">
              Flashcards
            </h2>
            <p className="text-white/80 text-lg">Organize cards by subject and study them by category</p>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4">
            {/* Category Study Buttons */}
            {availableCategories.map(category => {
              const categoryCards = getCardsForCategory(category);
              if (categoryCards.length === 0) return null;
              
              return (
                <button
                  key={category}
                  onClick={() => {
                    setSelectedCategory(category);
                    setStudyMode(true);
                    setCurrentCard(0);
                  }}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-2xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 font-bold shadow-lg hover:shadow-green-500/50 transform hover:scale-105 flex items-center"
                >
                  <Brain className="mr-2" size={20} />
                  Study {category === 'all' ? 'All' : category} ({categoryCards.length})
                </button>
              );
            })}

            <button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-6 py-3 rounded-2xl hover:from-blue-600 hover:to-cyan-700 transition-all duration-300 font-bold shadow-lg hover:shadow-blue-500/50 transform hover:scale-105 flex items-center"
            >
              <Plus className="mr-2" size={20} />
              Add Card
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-gradient-to-br from-blue-500/20 to-cyan-600/20 backdrop-blur-xl rounded-3xl border border-white/20 p-6 shadow-2xl">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-4 top-4 text-white/60" size={20} />
              <input
                type="text"
                placeholder="Search flashcards..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent font-medium"
              />
            </div>
          </div>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-6 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white font-medium focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
          >
            {subjects.map(subject => (
              <option key={subject} value={subject} className="bg-gray-800 text-white">
                {subject === 'all' ? '📚 All Subjects' : `📖 ${subject}`}
              </option>
            ))}
          </select>
        </div>
      </div>

      {showForm && (
        <div className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 backdrop-blur-xl rounded-3xl border border-white/20 p-8 shadow-2xl">
                      <h3 className="text-3xl font-bold text-white mb-6 flex items-center">
              {editingCard ? 'Edit Flashcard' : 'Create New Flashcard'}
            </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-white font-bold mb-3 text-lg">Question/Front</label>
              <textarea
                value={front}
                onChange={(e) => setFront(e.target.value)}
                className="w-full p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl resize-none text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent font-medium"
                rows="4"
                placeholder="What's the question or prompt?"
              />
            </div>
            <div>
              <label className="block text-white font-bold mb-3 text-lg">Answer/Back</label>
              <textarea
                value={back}
                onChange={(e) => setBack(e.target.value)}
                className="w-full p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl resize-none text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent font-medium"
                rows="4"
                placeholder="What's the answer or explanation?"
              />
            </div>
          </div>

          {/* Word Highlighting Feature */}
          {back.trim() && (
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <label className="block text-white font-bold text-lg">Highlight Key Words for Cloze Deletion</label>
                <button
                  type="button"
                  onClick={() => setShowHighlighting(!showHighlighting)}
                  className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-4 py-2 rounded-xl hover:from-purple-600 hover:to-pink-700 transition-all duration-300 font-bold text-sm"
                >
                  {showHighlighting ? 'Hide Highlighting' : 'Show Highlighting'}
                </button>
              </div>
              
              {showHighlighting && (
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/20 p-6">
                  <p className="text-white/80 mb-4 text-sm">
                    Click on important words in your answer that should be blanked out during cloze deletion study mode.
                  </p>
                  
                  <div className="bg-blue-500/20 border border-blue-400/30 rounded-lg p-4 mb-4">
                    <div className="text-blue-200 text-sm font-medium mb-2">📝 How Cloze Deletion Works:</div>
                    <div className="text-blue-100 text-xs space-y-1">
                      <div>• Highlight multiple words to give cloze deletion more options</div>
                      <div>• Each study session will randomly pick ONE highlighted word to blank out</div>
                      <div>• This keeps the exercise focused while giving variety across sessions</div>
                      <div>• Perfect for learning key terms, dates, names, or important concepts!</div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="text-white font-medium mb-2">Your Answer:</div>
                    <div className="bg-white/10 rounded-xl p-4 border border-white/20">
                      {back.split(' ').map((word, index) => {
                        const cleanWord = word.toLowerCase().replace(/[^\w]/g, '');
                        const isHighlighted = highlightedWords.includes(cleanWord);
                        return (
                          <span
                            key={index}
                            onClick={() => handleWordClick(word)}
                            className={`cursor-pointer inline-block mr-2 mb-1 px-2 py-1 rounded transition-all duration-200 ${
                              isHighlighted 
                                ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold' 
                                : 'hover:bg-white/20 text-white'
                            }`}
                          >
                            {word}
                          </span>
                        );
                      })}
                    </div>
                  </div>
                  
                  {highlightedWords.length > 0 && (
                    <div className="bg-gradient-to-r from-yellow-500/20 to-orange-600/20 rounded-xl p-4 border border-yellow-500/30">
                      <div className="text-white font-bold mb-2">Selected Words ({highlightedWords.length}):</div>
                      <div className="flex flex-wrap gap-2">
                        {highlightedWords.map((word, index) => (
                          <span
                            key={index}
                            className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-3 py-1 rounded-full font-bold text-sm"
                          >
                            {word}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          <div className="mb-6">
                          <label className="block text-white font-bold mb-3 text-lg">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent font-medium"
              placeholder="e.g., Math, History, Science..."
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-8 py-4 rounded-2xl hover:from-emerald-600 hover:to-green-700 transition-all duration-300 font-bold shadow-lg hover:shadow-emerald-500/50 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
                              {saving ? 'Saving...' : editingCard ? 'Update Card' : 'Create Card'}
            </button>
            <button
              onClick={cancelEdit}
              className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-8 py-4 rounded-2xl hover:from-gray-600 hover:to-gray-700 transition-all duration-300 font-bold shadow-lg hover:shadow-gray-500/50 transform hover:scale-105 flex items-center justify-center"
            >
                              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCards.map(card => {
          return (
            <div key={card.id} className="bg-gradient-to-br from-purple-500/20 to-indigo-600/20 backdrop-blur-xl rounded-3xl border-purple-500/30 p-6 shadow-2xl hover:shadow-indigo-500/25 transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 group animate-bounce-in relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="flex flex-wrap gap-2">
                  <span className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                    {card.subject}
                  </span>
                  {card.reviewCount > 0 && (
                    <span className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                      {card.reviewCount} reviews
                    </span>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => startEdit(card)}
                    className="p-2 bg-blue-500/20 backdrop-blur-sm rounded-xl text-blue-300 hover:text-blue-100 hover:bg-blue-500/30 transition-all duration-200 transform hover:scale-110"
                  >
                    <Edit3 size={18} />
                  </button>
                  <button
                    onClick={() => onDeleteFlashcard(card.id)}
                    className="p-2 bg-red-500/20 backdrop-blur-sm rounded-xl text-red-300 hover:text-red-100 hover:bg-red-500/30 transition-all duration-200 transform hover:scale-110"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <div className="mb-4 relative z-10">
                <p className="font-bold text-white mb-2 text-lg">Question:</p>
                <p className="text-white/90 font-medium leading-relaxed">{card.front}</p>
              </div>
              <div className="mb-4 relative z-10">
                <p className="font-bold text-white mb-2 text-lg">Answer:</p>
                <p className="text-white/90 font-medium leading-relaxed">{card.back}</p>
              </div>
              <div className="flex justify-between items-center text-sm text-white/60 border-t border-white/10 pt-4 relative z-10">
                <span>Created: {card.displayDate}</span>
                {card.lastReviewed && (
                  <span>Last studied: {new Date(card.lastReviewed).toLocaleDateString()}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredCards.length === 0 && !showForm && (
        <div className="bg-gradient-to-br from-gray-500/20 to-gray-600/20 backdrop-blur-xl rounded-3xl border border-white/20 p-12 shadow-2xl text-center animate-bounce-in">
          <div className="text-6xl mb-6">📚</div>
          <p className="text-white/80 mb-6 text-xl font-medium">
            {flashcards.length === 0 
              ? "No flashcards yet. Create your first card to get started!" 
              : "No cards match your search criteria."}
          </p>
          {flashcards.length === 0 && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-8 py-4 rounded-2xl hover:from-blue-600 hover:to-cyan-700 transition-all duration-300 font-bold shadow-lg hover:shadow-blue-500/50 transform hover:scale-105"
            >
              Create First Card
            </button>
          )}
        </div>
      )}
    </div>
  );
};

// Enhanced Pomodoro Component
const PomodoroTab = ({ time, isActive, onToggle, onReset, formatTime, onAddStudyLog, customInterval, onSetCustomTimer }) => {
  const [subject, setSubject] = useState('');
  const [notes, setNotes] = useState('');
  const [showLogForm, setShowLogForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleLogSession = async () => {
    if (subject.trim()) {
      setSaving(true);
      const duration = Math.round((customInterval * 60 - time) / 60);
      await onAddStudyLog(subject, duration, notes);
      setSubject('');
      setNotes('');
      setShowLogForm(false);
      setSaving(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-green-500/20 to-teal-600/20 backdrop-blur-xl rounded-3xl border border-white/20 p-8 shadow-2xl animate-slide-up text-center">
        <h2 className="text-4xl font-black text-white mb-4 flex items-center justify-center">
          Pomodoro Focus Timer
        </h2>
        <p className="text-white/80 text-xl font-medium max-w-2xl mx-auto">
          Boost your productivity with focused study sessions and break intervals
        </p>
      </div>
      
      {/* Session Length Selection */}
      <div className="bg-gradient-to-br from-blue-500/20 to-cyan-600/20 backdrop-blur-xl rounded-3xl border border-white/20 p-8 shadow-2xl animate-slide-up" style={{animationDelay: '0.1s'}}>
        <h3 className="text-3xl font-bold text-white mb-6 text-center">Session Length</h3>
        <div className="flex flex-wrap justify-center gap-4">
          {[15, 25, 45, 60].map(minutes => (
            <button
              key={minutes}
              onClick={() => onSetCustomTimer(minutes)}
              className={`px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 transform hover:scale-105 ${
                customInterval === minutes
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/50'
                  : 'bg-white/10 backdrop-blur-sm text-white/80 hover:bg-white/20 border border-white/20'
              }`}
            >
              {minutes} min
            </button>
          ))}
        </div>
      </div>
      
      {/* Main Timer */}
      <div className="bg-gradient-to-br from-purple-500/20 to-pink-600/20 backdrop-blur-xl rounded-3xl border border-white/20 p-12 shadow-2xl animate-slide-up text-center" style={{animationDelay: '0.2s'}}>

        
        <div className="relative inline-block mb-8">
          <div className="text-8xl md:text-9xl font-black text-white mb-6 animate-pulse">
            {formatTime(time)}
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 via-pink-400/20 to-purple-400/20 blur-3xl animate-pulse"></div>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-center gap-6 mb-8">
          <button
            onClick={onToggle}
            className={`flex items-center justify-center px-10 py-5 rounded-2xl text-white font-bold text-xl transition-all duration-300 shadow-2xl transform hover:scale-105 ${
              isActive 
                ? 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 hover:shadow-red-500/50' 
                : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 hover:shadow-green-500/50'
            }`}
          >
            {isActive ? <Pause className="mr-3" size={24} /> : <Play className="mr-3" size={24} />}
            {isActive ? 'Pause' : 'Start Focus'}
          </button>
          
          <button
            onClick={onReset}
            className="flex items-center justify-center px-10 py-5 rounded-2xl bg-gradient-to-r from-gray-500 to-gray-600 text-white font-bold text-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-300 shadow-2xl hover:shadow-gray-500/50 transform hover:scale-105"
          >
            <RotateCcw className="mr-3" size={24} />
            Reset
          </button>
        </div>

        <button
          onClick={() => setShowLogForm(true)}
          className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-4 rounded-2xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 font-bold shadow-lg hover:shadow-indigo-500/50 transform hover:scale-105"
        >
          Log Study Session
        </button>
      </div>

      {showLogForm && (
        <div className="bg-gradient-to-br from-orange-500/20 to-red-600/20 backdrop-blur-xl rounded-3xl border border-white/20 p-8 shadow-2xl animate-bounce-in">
          <h3 className="text-3xl font-bold text-white mb-6 flex items-center">
            Log Your Study Session
          </h3>
          <div className="space-y-6">
            <div>
              <label className="block text-white font-bold mb-3 text-lg">What did you study?</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent font-medium"
                placeholder="Math, History, Programming..."
              />
            </div>
            <div>
              <label className="block text-white font-bold mb-3 text-lg">Notes (optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl resize-none text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent font-medium"
                rows="4"
                placeholder="How did the session go? Any insights or challenges?"
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={handleLogSession}
                disabled={saving}
                className="bg-gradient-to-r from-orange-500 to-red-600 text-white px-8 py-4 rounded-2xl hover:from-orange-600 hover:to-red-700 transition-all duration-300 font-bold shadow-lg hover:shadow-orange-500/50 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {saving ? 'Saving...' : 'Log Session'}
              </button>
              <button
                onClick={() => setShowLogForm(false)}
                className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-8 py-4 rounded-2xl hover:from-gray-600 hover:to-gray-700 transition-all duration-300 font-bold shadow-lg hover:shadow-gray-500/50 transform hover:scale-105 flex items-center justify-center"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* How It Works */}
      <div className="bg-gradient-to-br from-teal-500/20 to-green-600/20 backdrop-blur-xl rounded-3xl border border-white/20 p-8 shadow-2xl animate-slide-up" style={{animationDelay: '0.3s'}}>
        <h3 className="text-3xl font-bold text-white mb-6 flex items-center">
          How Pomodoro Works
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="text-4xl mb-4">1</div>
            <h4 className="text-white font-bold text-lg mb-2">Choose Focus Time</h4>
            <p className="text-white/80">Select 15-60 minutes for deep concentration</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="text-4xl mb-4">2</div>
            <h4 className="text-white font-bold text-lg mb-2">Study Intensely</h4>
            <p className="text-white/80">Focus completely on your subject</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="text-4xl mb-4">3</div>
            <h4 className="text-white font-bold text-lg mb-2">Take Breaks</h4>
            <p className="text-white/80">5-minute breaks, longer after 4 sessions</p>
          </div>
        </div>
      </div>
    </div>
  );
};



// Brain Blurts Component (Enhanced with better search)
const BlurtsTab = ({ blurts, onAddBlurt, onDeleteBlurt }) => {
  const [content, setContent] = useState('');
  const [subject, setSubject] = useState('');
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');

  // Get unique subjects
  const subjects = ['all', ...new Set(blurts.map(blurt => blurt.subject))];

  // Filter blurts
  const filteredBlurts = blurts.filter(blurt => {
    const matchesSearch = blurt.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = selectedSubject === 'all' || blurt.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  const handleSubmit = async () => {
    if (content.trim()) {
      setSaving(true);
      await onAddBlurt(content, subject || 'General');
      setContent('');
      setSubject('');
      setSaving(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header Section */}
      <div className="bg-gradient-to-br from-yellow-500/20 to-orange-600/20 backdrop-blur-xl rounded-3xl border border-white/20 p-8 shadow-2xl animate-slide-up">
        <div className="text-center">
                      <h2 className="text-4xl font-black text-white mb-4 flex items-center justify-center">
              Brain Blurts
            </h2>
            <p className="text-white/80 text-xl font-medium max-w-2xl mx-auto">
              Capture brilliant thoughts, insights, and key concepts instantly while studying
            </p>
        </div>
      </div>

      {/* Add New Blurt Form */}
      <div className="bg-gradient-to-br from-purple-500/20 to-pink-600/20 backdrop-blur-xl rounded-3xl border border-white/20 p-8 shadow-2xl animate-slide-up" style={{animationDelay: '0.1s'}}>
                  <h3 className="text-3xl font-bold text-white mb-6 flex items-center">
            Capture Your Thoughts
          </h3>
        <div className="space-y-6">
          <div>
                          <label className="block text-white font-bold mb-3 text-lg">What's on your mind?</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl resize-none text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent font-medium"
              rows="5"
              placeholder="Write down any concept, insight, question, or brilliant idea..."
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-white font-bold mb-3 text-lg">Subject (optional)</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent font-medium"
                placeholder="Math, History, Science..."
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={handleSubmit}
                disabled={saving}
                className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-8 py-4 rounded-2xl hover:from-purple-600 hover:to-pink-700 transition-all duration-300 font-bold shadow-lg hover:shadow-purple-500/50 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                <Save className="mr-2" size={20} />
                {saving ? 'Saving...' : 'Save Blurt'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter */}
      {blurts.length > 0 && (
        <div className="bg-gradient-to-br from-cyan-500/20 to-blue-600/20 backdrop-blur-xl rounded-3xl border border-white/20 p-6 shadow-2xl animate-slide-up" style={{animationDelay: '0.2s'}}>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-4 top-4 text-white/60" size={20} />
                <input
                  type="text"
                  placeholder="Search your brilliant thoughts..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent font-medium"
                />
              </div>
            </div>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-6 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white font-medium focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent"
            >
              {subjects.map(subject => (
                <option key={subject} value={subject} className="bg-gray-800 text-white">
                  {subject === 'all' ? 'All Subjects' : subject}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Blurts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBlurts.length === 0 ? (
          <div className="col-span-full bg-gradient-to-br from-gray-500/20 to-gray-600/20 backdrop-blur-xl rounded-3xl border border-white/20 p-12 shadow-2xl text-center animate-bounce-in">
            <div className="text-6xl mb-6">📝</div>
            <p className="text-white/80 mb-6 text-xl font-medium">
              {blurts.length === 0 
                ? "No brain blurts yet. Start capturing your brilliant thoughts!" 
                : "No notes match your search criteria."}
            </p>
          </div>
        ) : (
          filteredBlurts.map((blurt, index) => (
            <div key={blurt.id} className="bg-gradient-to-br from-indigo-500/20 to-purple-600/20 backdrop-blur-xl rounded-3xl border border-white/20 p-6 shadow-2xl hover:shadow-indigo-500/25 transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 group animate-bounce-in relative overflow-hidden" style={{animationDelay: `${index * 0.1}s`}}>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <div className="flex justify-between items-start mb-4 relative z-10">
                <span className="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                  {blurt.subject}
                </span>
                <div className="flex items-center space-x-3">
                  <span className="text-white/60 text-sm font-medium">{blurt.timestamp}</span>
                  <button
                    onClick={() => onDeleteBlurt(blurt.id)}
                    className="p-2 bg-red-500/20 backdrop-blur-sm rounded-xl text-red-300 hover:text-red-100 hover:bg-red-500/30 transition-all duration-200 transform hover:scale-110"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <div className="relative z-10">
                <p className="text-white/90 font-medium leading-relaxed whitespace-pre-wrap">{blurt.content}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StudyApp;