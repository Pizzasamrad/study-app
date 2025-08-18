import React, { useState, useEffect, useCallback } from 'react';
import { Brain, Plus, Play, Pause, RotateCcw, Save, Edit3, Trash2, Search, Star, Calendar, Trophy, Award, Flame } from 'lucide-react';
import { auth, onAuthStateChanged } from './firebase';
import AuthModal from './components/Auth/AuthModal';

import SmartAnalytics from './components/Analytics/SmartAnalytics';
import AdvancedStudyModes from './components/Study/AdvancedStudyModes';
import StudyModeSelector from './components/Study/StudyModeSelector';
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
  
  // 🚀 NEW: Advanced Study Modes state
  const [studySession, setStudySession] = useState(null);
  const [studyMode, setStudyMode] = useState('active-recall');
  
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

  // Pomodoro Timer Logic
  useEffect(() => {
    let interval = null;
    if (isTimerActive && pomodoroTime > 0) {
      interval = setInterval(() => {
        setPomodoroTime(time => time - 1);
      }, 1000);
    } else if (pomodoroTime === 0) {
      setIsTimerActive(false);
      alert('Pomodoro session complete! Take a break.');
      setPomodoroTime(customInterval * 60);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, pomodoroTime, customInterval]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const resetTimer = () => {
    setIsTimerActive(false);
    setPomodoroTime(customInterval * 60);
  };

  // 🚀 NEW: Spaced Repetition Algorithm
  const calculateNextReview = (difficulty, currentInterval = 1) => {
    const easeFactor = {
      'easy': 2.5,
      'medium': 2.0,
      'hard': 1.3
    }[difficulty] || 2.0;
    
    const nextInterval = Math.ceil(currentInterval * easeFactor);
    const nextReviewDate = new Date();
    nextReviewDate.setDate(nextReviewDate.getDate() + nextInterval);
    
    return {
      nextReviewDate: nextReviewDate.toISOString(),
      interval: nextInterval,
      reviewCount: 1
    };
  };

  const getDueCards = () => {
    const now = new Date().toISOString();
    return flashcards.filter(card => 
      !card.nextReviewDate || card.nextReviewDate <= now
    );
  };

  // 🚀 Enhanced Flashcard Management with Celebrations and Cloud Sync
  const addFlashcard = async (front, back, subject) => {
    try {
      const newCard = {
        front,
        back,
        subject,
        displayDate: new Date().toLocaleDateString(),
        difficulty: 'medium',
        reviewCount: 0,
        interval: 1,
        nextReviewDate: new Date().toISOString()
      };
      
      const savedCard = await storageService.saveFlashcard(newCard);
      
      // Update local state with the new card
      setFlashcards(prev => [...prev, savedCard]);
      
      // Celebrate first flashcard or milestone
      if (flashcards.length === 0) {
        triggerCelebration('first_card', { message: '🎯 Your first flashcard is ready! The journey to mastery begins now!' });
      } else if ((flashcards.length + 1) % 10 === 0) {
        triggerCelebration('milestone', { 
          message: `🚀 BOOM! ${flashcards.length + 1} flashcards created! You're building an incredible knowledge base!`,
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

  // 🚀 Review flashcard with spaced repetition and celebrations
  const reviewFlashcard = async (id, difficulty) => {
    const card = flashcards.find(c => c.id === id);
    if (!card) return;

    const reviewData = calculateNextReview(difficulty, card.interval || 1);
    const updates = {
      ...reviewData,
      difficulty,
      reviewCount: (card.reviewCount || 0) + 1,
      lastReviewed: new Date().toISOString()
    };

    await updateFlashcard(id, updates);
    
    // Celebrate review milestones
    const newReviewCount = (card.reviewCount || 0) + 1;
    if (newReviewCount === 1) {
      triggerCelebration('first_review', { message: '🎊 First review crushed! Your brain is already getting stronger!' });
    } else if (newReviewCount === 10) {
      triggerCelebration('review_master', { message: '🏆 LEGEND STATUS! 10 reviews on this card - you\'re a memory master!' });
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
          3: '🔥 3-day streak! You\'re building momentum!',
          7: '🚀 7-day streak! You\'re on fire!',
          14: '💪 14-day streak! Unstoppable!',
          30: '🏆 30-day streak! LEGEND STATUS!',
          50: '👑 50-day streak! ROYALTY!',
          100: '🌟 100-day streak! IMMORTAL!'
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

  // 🚀 NEW: Advanced Study Session Functions
  const startStudySession = (mode, type) => {
    setStudyMode(mode);
    setStudySession({
      id: Date.now().toString(),
      mode,
      type,
      startTime: new Date().toISOString(),
      cards: []
    });
  };

  const handleStudySessionComplete = async (sessionData) => {
    setStudySession(null);
    
    // Add study log for the session
    addStudyLog(
      `Study Session - ${sessionData.mode}`,
      Math.round(sessionData.duration / 60),
      `Completed ${sessionData.total} cards with ${sessionData.correct} correct answers`
    );
    
    // Update user stats
    try {
      const updatedStats = await userDataService.updateUserStats(sessionData, devStats);
      setDevStats(updatedStats);
    } catch (error) {
      console.error('Error updating user stats:', error);
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

  const dueCards = getDueCards();



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
            dueCards={dueCards}
            streakData={{ current: devStats.currentStreak, longest: devStats.longestStreak }}
            onTabChange={setActiveTab}
            blurts={blurts}
          />
        )}

        {/* Flashcards Tab */}
                {activeTab === 'flashcards' && (
          <FlashcardsTab
            flashcards={flashcards}
            dueCards={dueCards}
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

        {/* Study Tab */}
        {activeTab === 'study' && (
          <div className="space-y-6">
            <StudyModeSelector 
              onModeSelect={setStudyMode}
              onStartSession={startStudySession}
              flashcards={flashcards}
            />
            {studySession && (
              <AdvancedStudyModes
                flashcards={flashcards}
                onReviewFlashcard={reviewFlashcard}
                onCompleteSession={handleStudySessionComplete}
                studyMode={studyMode}
                user={user}
              />
            )}
          </div>
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

        {/* Developer Testing Panel */}
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
      </div>
    </div>
  );
};

// 🚀 ENHANCED: Flashcards Component with Editing and Spaced Repetition
const FlashcardsTab = ({ flashcards, dueCards, onAddFlashcard, onUpdateFlashcard, onDeleteFlashcard, onReviewFlashcard }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingCard, setEditingCard] = useState(null);
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [subject, setSubject] = useState('');
  const [reviewMode, setReviewMode] = useState(false);
  const [currentCard, setCurrentCard] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');

  // Get unique subjects
  const subjects = ['all', ...new Set(flashcards.map(card => card.subject))];

  // Filter cards based on search and subject
  const filteredCards = flashcards.filter(card => {
    const matchesSearch = card.front.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         card.back.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = selectedSubject === 'all' || card.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  const handleSubmit = async () => {
    if (front.trim() && back.trim()) {
      setSaving(true);
      if (editingCard) {
        await onUpdateFlashcard(editingCard.id, { front, back, subject: subject || 'General' });
        setEditingCard(null);
      } else {
        await onAddFlashcard(front, back, subject || 'General');
      }
      setFront('');
      setBack('');
      setSubject('');
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
    setCurrentCard((prev) => (prev + 1) % dueCards.length);
  };

  const prevCard = () => {
    setShowAnswer(false);
    setCurrentCard((prev) => (prev - 1 + dueCards.length) % dueCards.length);
  };

  const handleReview = async (difficulty) => {
    const card = dueCards[currentCard];
    await onReviewFlashcard(card.id, difficulty);
    nextCard();
  };

  if (reviewMode && dueCards.length > 0) {
    const card = dueCards[currentCard];
    
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-gradient-to-br from-indigo-500/20 to-purple-600/20 backdrop-blur-xl rounded-3xl border border-white/20 p-6 shadow-2xl">
          <div className="flex justify-between items-center">
            <button
              onClick={() => {
                setReviewMode(false);
                setCurrentCard(0);
              }}
              className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-6 py-3 rounded-2xl hover:from-gray-600 hover:to-gray-700 transition-all duration-300 font-bold shadow-lg hover:shadow-gray-500/50 transform hover:scale-105 flex items-center"
            >
              ← 🏠 Back to Cards
            </button>
            <span className="text-white font-bold text-lg">
              📊 {currentCard + 1} of {dueCards.length} 🔥 (Due for Review)
            </span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500/20 to-cyan-600/20 backdrop-blur-xl rounded-3xl border border-white/20 p-12 min-h-96 flex flex-col justify-center items-center text-center shadow-2xl">
          <div className="mb-6 flex flex-wrap items-center justify-center gap-3">
            <span className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-4 py-2 rounded-full font-bold">
              📚 {card.subject}
            </span>
            {card.reviewCount > 0 && (
              <span className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-full font-bold">
                ⭐ Reviewed {card.reviewCount} times
              </span>
            )}
          </div>
          
          <div className="text-2xl font-bold text-white mb-8 min-h-24 flex items-center justify-center leading-relaxed max-w-2xl">
            {showAnswer ? `💡 ${card.back}` : `❓ ${card.front}`}
          </div>

          {!showAnswer ? (
            <button
              onClick={() => setShowAnswer(true)}
              className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-10 py-4 rounded-2xl hover:from-blue-600 hover:to-cyan-700 transition-all duration-300 font-bold text-lg shadow-lg hover:shadow-blue-500/50 transform hover:scale-105 mb-6"
            >
              ✨ Show Answer
            </button>
          ) : (
            <div className="space-y-6">
              <p className="text-white/80 mb-6 text-lg font-medium">🤔 How well did you remember this?</p>
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                <button 
                  onClick={() => handleReview('hard')}
                  className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-8 py-4 rounded-2xl hover:from-red-600 hover:to-pink-700 transition-all duration-300 font-bold shadow-lg hover:shadow-red-500/50 transform hover:scale-105"
                >
                  😰 Hard
                </button>
                <button 
                  onClick={() => handleReview('medium')}
                  className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white px-8 py-4 rounded-2xl hover:from-yellow-600 hover:to-orange-700 transition-all duration-300 font-bold shadow-lg hover:shadow-yellow-500/50 transform hover:scale-105"
                >
                  🤔 Medium
                </button>
                <button 
                  onClick={() => handleReview('easy')}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-2xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 font-bold shadow-lg hover:shadow-green-500/50 transform hover:scale-105"
                >
                  😎 Easy
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 mt-8">
            <button 
              onClick={prevCard} 
              className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-8 py-3 rounded-2xl hover:from-gray-600 hover:to-gray-700 transition-all duration-300 font-bold shadow-lg hover:shadow-gray-500/50 transform hover:scale-105"
            >
              ⬅️ Previous
            </button>
            <button 
              onClick={nextCard} 
              className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-8 py-3 rounded-2xl hover:from-gray-600 hover:to-gray-700 transition-all duration-300 font-bold shadow-lg hover:shadow-gray-500/50 transform hover:scale-105"
            >
              Next ➡️
            </button>
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
              🧠 Flashcards
            </h2>
            <p className="text-white/80 text-lg">Master your knowledge with spaced repetition</p>
          </div>
          
          {/* Action Buttons */}
          <div className="flex flex-wrap gap-4">
            {dueCards.length > 0 && (
              <button
                onClick={() => {
                  setReviewMode(true);
                  setCurrentCard(0);
                }}
                className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-6 py-3 rounded-2xl hover:from-red-600 hover:to-pink-700 transition-all duration-300 font-bold shadow-lg hover:shadow-red-500/50 transform hover:scale-105 flex items-center"
              >
                <Calendar className="mr-2" size={20} />
                🔥 Review Due ({dueCards.length})
              </button>
            )}

            <button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-6 py-3 rounded-2xl hover:from-blue-600 hover:to-cyan-700 transition-all duration-300 font-bold shadow-lg hover:shadow-blue-500/50 transform hover:scale-105 flex items-center"
            >
              <Plus className="mr-2" size={20} />
              ✨ Add Card
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
                placeholder="🔍 Search flashcards..."
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
            {editingCard ? '✏️ Edit Flashcard' : '✨ Create New Flashcard'}
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-white font-bold mb-3 text-lg">❓ Question/Front</label>
              <textarea
                value={front}
                onChange={(e) => setFront(e.target.value)}
                className="w-full p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl resize-none text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent font-medium"
                rows="4"
                placeholder="What's the question or prompt?"
              />
            </div>
            <div>
              <label className="block text-white font-bold mb-3 text-lg">💡 Answer/Back</label>
              <textarea
                value={back}
                onChange={(e) => setBack(e.target.value)}
                className="w-full p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl resize-none text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent font-medium"
                rows="4"
                placeholder="What's the answer or explanation?"
              />
            </div>
          </div>
          <div className="mb-6">
            <label className="block text-white font-bold mb-3 text-lg">📚 Subject</label>
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
              {saving ? '⏳ Saving...' : editingCard ? '✅ Update Card' : '🚀 Create Card'}
            </button>
            <button
              onClick={cancelEdit}
              className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-8 py-4 rounded-2xl hover:from-gray-600 hover:to-gray-700 transition-all duration-300 font-bold shadow-lg hover:shadow-gray-500/50 transform hover:scale-105 flex items-center justify-center"
            >
              ❌ Cancel
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCards.map(card => {
          const isDue = card.nextReviewDate && card.nextReviewDate <= new Date().toISOString();
          return (
            <div key={card.id} className={`${isDue ? 'bg-gradient-to-br from-red-500/20 to-pink-600/20' : 'bg-gradient-to-br from-purple-500/20 to-indigo-600/20'} backdrop-blur-xl rounded-3xl border-purple-500/30 p-6 shadow-2xl hover:shadow-${isDue ? 'red' : 'indigo'}-500/25 transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 group animate-bounce-in relative overflow-hidden`}>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="flex flex-wrap gap-2">
                  <span className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                    📚 {card.subject}
                  </span>
                  {isDue && (
                    <span className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-3 py-1 rounded-full text-sm font-bold animate-pulse">
                      🔥 Due
                    </span>
                  )}
                  {card.reviewCount > 0 && (
                    <span className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                      ⭐ {card.reviewCount} reviews
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
                <p className="font-bold text-white mb-2 text-lg">❓ Question:</p>
                <p className="text-white/90 font-medium leading-relaxed">{card.front}</p>
              </div>
              <div className="mb-4 relative z-10">
                <p className="font-bold text-white mb-2 text-lg">💡 Answer:</p>
                <p className="text-white/90 font-medium leading-relaxed">{card.back}</p>
              </div>
              <div className="flex justify-between items-center text-sm text-white/60 border-t border-white/10 pt-4 relative z-10">
                <span>📅 Created: {card.displayDate}</span>
                {card.nextReviewDate && (
                  <span>Next: {new Date(card.nextReviewDate).toLocaleDateString()}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredCards.length === 0 && !showForm && (
        <div className="bg-gradient-to-br from-gray-500/20 to-gray-600/20 backdrop-blur-xl rounded-3xl border border-white/20 p-12 shadow-2xl text-center animate-bounce-in">
          <div className="text-6xl mb-6">🧠</div>
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
              ✨ Create First Card
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
          ⏰ Pomodoro Focus Timer
        </h2>
        <p className="text-white/80 text-xl font-medium max-w-2xl mx-auto">
          🎯 Boost your productivity with focused study sessions and break intervals ⚡
        </p>
      </div>
      
      {/* Session Length Selection */}
      <div className="bg-gradient-to-br from-blue-500/20 to-cyan-600/20 backdrop-blur-xl rounded-3xl border border-white/20 p-8 shadow-2xl animate-slide-up" style={{animationDelay: '0.1s'}}>
        <h3 className="text-3xl font-bold text-white mb-6 text-center">⚙️ Session Length</h3>
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
            {isActive ? '⏸️ Pause' : '▶️ Start Focus'}
          </button>
          
          <button
            onClick={onReset}
            className="flex items-center justify-center px-10 py-5 rounded-2xl bg-gradient-to-r from-gray-500 to-gray-600 text-white font-bold text-xl hover:from-gray-600 hover:to-gray-700 transition-all duration-300 shadow-2xl hover:shadow-gray-500/50 transform hover:scale-105"
          >
            <RotateCcw className="mr-3" size={24} />
            🔄 Reset
          </button>
        </div>

        <button
          onClick={() => setShowLogForm(true)}
          className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-4 rounded-2xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 font-bold shadow-lg hover:shadow-indigo-500/50 transform hover:scale-105"
        >
          📝 Log Study Session
        </button>
      </div>

      {showLogForm && (
        <div className="bg-gradient-to-br from-orange-500/20 to-red-600/20 backdrop-blur-xl rounded-3xl border border-white/20 p-8 shadow-2xl animate-bounce-in">
          <h3 className="text-3xl font-bold text-white mb-6 flex items-center">
            📝 Log Your Study Session
          </h3>
          <div className="space-y-6">
            <div>
              <label className="block text-white font-bold mb-3 text-lg">📚 What did you study?</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full p-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent font-medium"
                placeholder="Math, History, Programming..."
              />
            </div>
            <div>
              <label className="block text-white font-bold mb-3 text-lg">💭 Notes (optional)</label>
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
                {saving ? '⏳ Saving...' : '✅ Log Session'}
              </button>
              <button
                onClick={() => setShowLogForm(false)}
                className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-8 py-4 rounded-2xl hover:from-gray-600 hover:to-gray-700 transition-all duration-300 font-bold shadow-lg hover:shadow-gray-500/50 transform hover:scale-105 flex items-center justify-center"
              >
                ❌ Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* How It Works */}
      <div className="bg-gradient-to-br from-teal-500/20 to-green-600/20 backdrop-blur-xl rounded-3xl border border-white/20 p-8 shadow-2xl animate-slide-up" style={{animationDelay: '0.3s'}}>
        <h3 className="text-3xl font-bold text-white mb-6 flex items-center">
          🎯 How Pomodoro Works
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="text-4xl mb-4">⏱️</div>
            <h4 className="text-white font-bold text-lg mb-2">1. Choose Focus Time</h4>
            <p className="text-white/80">Select 15-60 minutes for deep concentration</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="text-4xl mb-4">🎯</div>
            <h4 className="text-white font-bold text-lg mb-2">2. Study Intensely</h4>
            <p className="text-white/80">Focus completely on your subject</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <div className="text-4xl mb-4">☕</div>
            <h4 className="text-white font-bold text-lg mb-2">3. Take Breaks</h4>
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
            🧠 Brain Blurts
          </h2>
          <p className="text-white/80 text-xl font-medium max-w-2xl mx-auto">
            💡 Capture brilliant thoughts, insights, and key concepts instantly while studying ✨
          </p>
        </div>
      </div>

      {/* Add New Blurt Form */}
      <div className="bg-gradient-to-br from-purple-500/20 to-pink-600/20 backdrop-blur-xl rounded-3xl border border-white/20 p-8 shadow-2xl animate-slide-up" style={{animationDelay: '0.1s'}}>
        <h3 className="text-3xl font-bold text-white mb-6 flex items-center">
          ✨ Capture Your Thoughts
        </h3>
        <div className="space-y-6">
          <div>
            <label className="block text-white font-bold mb-3 text-lg">💭 What's on your mind?</label>
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
              <label className="block text-white font-bold mb-3 text-lg">📚 Subject (optional)</label>
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
                {saving ? '⏳ Saving...' : '🚀 Save Blurt'}
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
                  placeholder="🔍 Search your brilliant thoughts..."
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
      )}

      {/* Blurts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredBlurts.length === 0 ? (
          <div className="col-span-full bg-gradient-to-br from-gray-500/20 to-gray-600/20 backdrop-blur-xl rounded-3xl border border-white/20 p-12 shadow-2xl text-center animate-bounce-in">
            <div className="text-6xl mb-6">💭</div>
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
                  📚 {blurt.subject}
                </span>
                <div className="flex items-center space-x-3">
                  <span className="text-white/60 text-sm font-medium">📅 {blurt.timestamp}</span>
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