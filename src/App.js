import React, { useState, useEffect, useCallback } from 'react';
import { Clock, BookOpen, Brain, Plus, Play, Pause, RotateCcw, Save, Edit3, Trash2, Search, BarChart3, Star, Calendar } from 'lucide-react';

const StudyApp = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [flashcards, setFlashcards] = useState([]);
  const [studyLogs, setStudyLogs] = useState([]);
  const [pomodoroTime, setPomodoroTime] = useState(25 * 60);
  const [customInterval, setCustomInterval] = useState(25);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [blurts, setBlurts] = useState([]);

  // Generate device ID
  const getDeviceId = () => {
    let deviceId = localStorage.getItem('studyapp-device-id');
    if (!deviceId) {
      deviceId = 'device-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('studyapp-device-id', deviceId);
    }
    return deviceId;
  };

  const deviceId = getDeviceId();

  // Simulate Firebase operations with localStorage
  const saveToStorage = useCallback((collection, data) => {
    const key = `${deviceId}-${collection}`;
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    const newData = [...existing, { ...data, id: Date.now().toString(), createdAt: new Date().toISOString() }];
    localStorage.setItem(key, JSON.stringify(newData));
    return newData;
  }, [deviceId]);

  const loadFromStorage = useCallback((collection) => {
    const key = `${deviceId}-${collection}`;
    return JSON.parse(localStorage.getItem(key) || '[]');
  }, [deviceId]);

  const updateInStorage = useCallback((collection, id, updates) => {
    const key = `${deviceId}-${collection}`;
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    const updated = existing.map(item => 
      item.id === id ? { ...item, ...updates, lastModified: new Date().toISOString() } : item
    );
    localStorage.setItem(key, JSON.stringify(updated));
    return updated;
  }, [deviceId]);

  const deleteFromStorage = useCallback((collection, id) => {
    const key = `${deviceId}-${collection}`;
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    const filtered = existing.filter(item => item.id !== id);
    localStorage.setItem(key, JSON.stringify(filtered));
    return filtered;
  }, [deviceId]);

  // Load data on mount
  useEffect(() => {
    setFlashcards(loadFromStorage('flashcards'));
    setStudyLogs(loadFromStorage('studyLogs'));
    setBlurts(loadFromStorage('blurts'));
  }, [deviceId, loadFromStorage]);

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
  }, [isTimerActive, pomodoroTime]);

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

  // 🚀 NEW: Enhanced Flashcard Management
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
      const updated = saveToStorage('flashcards', newCard);
      setFlashcards(updated);
    } catch (error) {
      console.error('Error adding flashcard:', error);
      alert('Error saving flashcard. Please try again.');
    }
  };

  const updateFlashcard = async (id, updates) => {
    try {
      const updated = updateInStorage('flashcards', id, updates);
      setFlashcards(updated);
    } catch (error) {
      console.error('Error updating flashcard:', error);
      alert('Error updating flashcard. Please try again.');
    }
  };

  const deleteFlashcard = async (id) => {
    try {
      const updated = deleteFromStorage('flashcards', id);
      setFlashcards(updated);
    } catch (error) {
      console.error('Error deleting flashcard:', error);
      alert('Error deleting flashcard. Please try again.');
    }
  };

  // 🚀 NEW: Review flashcard with spaced repetition
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
      const updated = saveToStorage('studyLogs', newLog);
      setStudyLogs(updated);
    } catch (error) {
      console.error('Error adding study log:', error);
      alert('Error saving study log. Please try again.');
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
      const updated = saveToStorage('blurts', newBlurt);
      setBlurts(updated);
    } catch (error) {
      console.error('Error adding blurt:', error);
      alert('Error saving brain blurt. Please try again.');
    }
  };

  const deleteBlurt = async (id) => {
    try {
      const updated = deleteFromStorage('blurts', id);
      setBlurts(updated);
    } catch (error) {
      console.error('Error deleting blurt:', error);
      alert('Error deleting brain blurt. Please try again.');
    }
  };

  const dueCards = getDueCards();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">StudyMaster Pro</h1>
          <p className="text-gray-600">AI-powered study companion with spaced repetition</p>
          <p className="text-sm text-green-600 mt-2">✨ Your data is private to this device</p>
        </div>

        {/* Navigation */}
        <nav className="flex justify-center mb-8">
          <div className="bg-white rounded-lg shadow-md p-2 flex space-x-2">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BookOpen },
              { id: 'flashcards', label: 'Flashcards', icon: Brain },
              { id: 'pomodoro', label: 'Pomodoro', icon: Clock },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 },
              { id: 'blurts', label: 'Brain Blurts', icon: Edit3 }
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
                  activeTab === id 
                    ? 'bg-blue-500 text-white' 
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon size={18} />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </nav>

        {/* Dashboard */}
        {activeTab === 'dashboard' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <Brain className="mr-2 text-blue-500" />
                Flashcards
              </h3>
              <p className="text-gray-600 mb-2">Total: {flashcards.length} cards</p>
              <p className="text-red-600 mb-4">Due: {dueCards.length} cards</p>
              <button
                onClick={() => setActiveTab('flashcards')}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
              >
                Study Now
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <Clock className="mr-2 text-green-500" />
                Study Sessions
              </h3>
              <p className="text-gray-600 mb-4">Logged: {studyLogs.length} sessions</p>
              <button
                onClick={() => setActiveTab('pomodoro')}
                className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors"
              >
                Start Timer
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <BarChart3 className="mr-2 text-purple-500" />
                Analytics
              </h3>
              <p className="text-gray-600 mb-4">Total: {studyLogs.reduce((sum, log) => sum + log.duration, 0)} minutes</p>
              <button
                onClick={() => setActiveTab('analytics')}
                className="bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600 transition-colors"
              >
                View Stats
              </button>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <Edit3 className="mr-2 text-orange-500" />
                Brain Blurts
              </h3>
              <p className="text-gray-600 mb-4">Notes: {blurts.length} entries</p>
              <button
                onClick={() => setActiveTab('blurts')}
                className="bg-orange-500 text-white px-4 py-2 rounded-md hover:bg-orange-600 transition-colors"
              >
                Quick Note
              </button>
            </div>

            {/* Recent Study Logs */}
            <div className="md:col-span-2 lg:col-span-4 bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-4">Recent Study Sessions</h3>
              {studyLogs.length === 0 ? (
                <p className="text-gray-500">No study sessions logged yet. Start studying to track your progress!</p>
              ) : (
                <div className="space-y-2">
                  {studyLogs.slice(0, 5).map(log => (
                    <div key={log.id} className="border-l-4 border-blue-500 pl-4 py-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold">{log.subject}</h4>
                          <p className="text-sm text-gray-600">{log.duration} minutes - {log.date} at {log.time}</p>
                          {log.notes && <p className="text-sm text-gray-700 mt-1">{log.notes}</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
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

        {/* 🚀 NEW: Analytics Tab */}
        {activeTab === 'analytics' && (
          <AnalyticsTab studyLogs={studyLogs} flashcards={flashcards} />
        )}

        {/* Brain Blurts Tab */}
        {activeTab === 'blurts' && (
          <BlurtsTab
            blurts={blurts}
            onAddBlurt={addBlurt}
            onDeleteBlurt={deleteBlurt}
          />
        )}
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
  const [studyMode, setStudyMode] = useState(false);
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
    const cards = reviewMode ? dueCards : filteredCards;
    setCurrentCard((prev) => (prev + 1) % cards.length);
  };

  const prevCard = () => {
    setShowAnswer(false);
    const cards = reviewMode ? dueCards : filteredCards;
    setCurrentCard((prev) => (prev - 1 + cards.length) % cards.length);
  };

  const handleReview = async (difficulty) => {
    const cards = reviewMode ? dueCards : filteredCards;
    const card = cards[currentCard];
    await onReviewFlashcard(card.id, difficulty);
    nextCard();
  };

  if ((studyMode || reviewMode) && (filteredCards.length > 0 || dueCards.length > 0)) {
    const cards = reviewMode ? dueCards : filteredCards;
    const card = cards[currentCard];
    
    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => {
              setStudyMode(false);
              setReviewMode(false);
              setCurrentCard(0);
            }}
            className="text-blue-500 hover:text-blue-700"
          >
            ← Back to Cards
          </button>
          <span className="text-gray-600">
            {currentCard + 1} of {cards.length} {reviewMode ? '(Due for Review)' : ''}
          </span>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 min-h-64 flex flex-col justify-center items-center text-center">
          <div className="mb-4 flex items-center space-x-2">
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
              {card.subject}
            </span>
            {card.reviewCount > 0 && (
              <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                Reviewed {card.reviewCount} times
              </span>
            )}
          </div>
          
          <div className="text-xl mb-6 min-h-16">
            {showAnswer ? card.back : card.front}
          </div>

          {!showAnswer ? (
            <button
              onClick={() => setShowAnswer(true)}
              className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 mb-4"
            >
              Show Answer
            </button>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 mb-4">How well did you remember this?</p>
              <div className="flex space-x-2 mb-4">
                <button 
                  onClick={() => handleReview('hard')}
                  className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                >
                  Hard
                </button>
                <button 
                  onClick={() => handleReview('medium')}
                  className="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600"
                >
                  Medium
                </button>
                <button 
                  onClick={() => handleReview('easy')}
                  className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
                >
                  Easy
                </button>
              </div>
            </div>
          )}

          <div className="flex space-x-4 mt-4">
            <button onClick={prevCard} className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600">
              Previous
            </button>
            <button onClick={nextCard} className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600">
              Next
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Flashcards</h2>
        <div className="space-x-4">
          {dueCards.length > 0 && (
            <button
              onClick={() => {
                setReviewMode(true);
                setCurrentCard(0);
              }}
              className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 flex items-center"
            >
              <Calendar className="mr-2" size={16} />
              Review Due ({dueCards.length})
            </button>
          )}
          {filteredCards.length > 0 && (
            <button
              onClick={() => {
                setStudyMode(true);
                setCurrentCard(0);
              }}
              className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 flex items-center"
            >
              <Play className="mr-2" size={16} />
              Study Mode
            </button>
          )}
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 flex items-center"
          >
            <Plus className="mr-2" size={16} />
            Add Card
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <div className="flex space-x-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Search flashcards..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-md"
              />
            </div>
          </div>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-4 py-2 border rounded-md"
          >
            {subjects.map(subject => (
              <option key={subject} value={subject}>
                {subject === 'all' ? 'All Subjects' : subject}
              </option>
            ))}
          </select>
        </div>
      </div>

      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">
            {editingCard ? 'Edit Flashcard' : 'Add New Flashcard'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">Question/Front</label>
              <textarea
                value={front}
                onChange={(e) => setFront(e.target.value)}
                className="w-full p-3 border rounded-md resize-none"
                rows="3"
                placeholder="Enter the question..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Answer/Back</label>
              <textarea
                value={back}
                onChange={(e) => setBack(e.target.value)}
                className="w-full p-3 border rounded-md resize-none"
                rows="3"
                placeholder="Enter the answer..."
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full p-3 border rounded-md"
              placeholder="e.g., Math, History, Science..."
            />
          </div>
          <div className="flex space-x-4">
            <button
              onClick={handleSubmit}
              disabled={saving}
              className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50"
            >
              {saving ? 'Saving...' : editingCard ? 'Update Card' : 'Add Card'}
            </button>
            <button
              onClick={cancelEdit}
              className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCards.map(card => {
          const isDue = card.nextReviewDate && card.nextReviewDate <= new Date().toISOString();
          return (
            <div key={card.id} className={`bg-white rounded-lg shadow-md p-4 border-l-4 ${isDue ? 'border-red-500' : 'border-blue-500'}`}>
              <div className="flex justify-between items-start mb-2">
                <div className="flex space-x-2">
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                    {card.subject}
                  </span>
                  {isDue && (
                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs">
                      Due
                    </span>
                  )}
                  {card.reviewCount > 0 && (
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                      {card.reviewCount} reviews
                    </span>
                  )}
                </div>
                <div className="flex space-x-1">
                  <button
                    onClick={() => startEdit(card)}
                    className="text-blue-500 hover:text-blue-700"
                  >
                    <Edit3 size={16} />
                  </button>
                  <button
                    onClick={() => onDeleteFlashcard(card.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <div className="mb-2">
                <p className="font-semibold text-sm mb-1">Q:</p>
                <p className="text-sm text-gray-700">{card.front}</p>
              </div>
              <div className="mb-2">
                <p className="font-semibold text-sm mb-1">A:</p>
                <p className="text-sm text-gray-700">{card.back}</p>
              </div>
              <div className="flex justify-between items-center text-xs text-gray-500">
                <span>Created: {card.displayDate}</span>
                {card.nextReviewDate && (
                  <span>Next: {new Date(card.nextReviewDate).toLocaleDateString()}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredCards.length === 0 && !showForm && (
        <div className="text-center py-12">
          <Brain className="mx-auto mb-4 text-gray-400" size={48} />
          <p className="text-gray-500 mb-4">
            {flashcards.length === 0 
              ? "No flashcards yet. Create your first card to get started!" 
              : "No cards match your search criteria."}
          </p>
          {flashcards.length === 0 && (
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600"
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
    <div className="max-w-2xl mx-auto text-center">
      <h2 className="text-2xl font-bold mb-8">Pomodoro Timer</h2>
      
      {/* Custom Interval Selection */}
      <div className="bg-white rounded-lg shadow-md p-4 mb-6">
        <h3 className="text-lg font-semibold mb-4">Session Length</h3>
        <div className="flex justify-center space-x-2 mb-4">
          {[15, 25, 45, 60].map(minutes => (
            <button
              key={minutes}
              onClick={() => onSetCustomTimer(minutes)}
              className={`px-4 py-2 rounded-md ${
                customInterval === minutes
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {minutes}m
            </button>
          ))}
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
        <div className="text-6xl font-bold text-blue-600 mb-6">
          {formatTime(time)}
        </div>
        
        <div className="flex justify-center space-x-4 mb-6">
          <button
            onClick={onToggle}
            className={`flex items-center px-6 py-3 rounded-md text-white font-semibold ${
              isActive ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'
            }`}
          >
            {isActive ? <Pause className="mr-2" size={20} /> : <Play className="mr-2" size={20} />}
            {isActive ? 'Pause' : 'Start'}
          </button>
          
          <button
            onClick={onReset}
            className="flex items-center px-6 py-3 rounded-md bg-gray-500 text-white font-semibold hover:bg-gray-600"
          >
            <RotateCcw className="mr-2" size={20} />
            Reset
          </button>
        </div>

        <button
          onClick={() => setShowLogForm(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
        >
          Log Study Session
        </button>
      </div>

      {showLogForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4">Log Study Session</h3>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full p-3 border rounded-md"
              placeholder="What did you study?"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-3 border rounded-md resize-none"
              rows="3"
              placeholder="Any additional notes..."
            />
          </div>
          <div className="flex space-x-4">
            <button
              onClick={handleLogSession}
              disabled={saving}
              className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Log Session'}
            </button>
            <button
              onClick={() => setShowLogForm(false)}
              className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="text-left bg-gray-50 rounded-lg p-4">
        <h3 className="font-semibold mb-2">How Pomodoro Works:</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Choose your focus time (15-60 minutes)</li>
          <li>• Study with full concentration</li>
          <li>• Take a 5-minute break when timer ends</li>
          <li>• After 4 sessions, take a longer 15-30 minute break</li>
          <li>• Log your sessions to track progress</li>
        </ul>
      </div>
    </div>
  );
};

// 🚀 NEW: Analytics Tab Component (Simple Charts)
const AnalyticsTab = ({ studyLogs, flashcards }) => {
  const getAnalyticsData = () => {
    // Subject breakdown
    const subjectData = studyLogs.reduce((acc, log) => {
      acc[log.subject] = (acc[log.subject] || 0) + log.duration;
      return acc;
    }, {});

    const chartData = Object.entries(subjectData).map(([subject, minutes]) => ({
      subject,
      minutes
    }));

    // Weekly progress
    const weeklyData = studyLogs.reduce((acc, log) => {
      const date = new Date(log.createdAt || Date.now()).toLocaleDateString();
      acc[date] = (acc[date] || 0) + log.duration;
      return acc;
    }, {});

    const weeklyChartData = Object.entries(weeklyData)
      .slice(-7)
      .map(([date, minutes]) => ({ date, minutes }));

    // Study insights
    const totalMinutes = studyLogs.reduce((sum, log) => sum + log.duration, 0);
    const averageSession = studyLogs.length > 0 ? Math.round(totalMinutes / studyLogs.length) : 0;
    const totalCards = flashcards.length;
    const reviewedCards = flashcards.filter(card => card.reviewCount > 0).length;
    const dueCards = flashcards.filter(card => 
      card.nextReviewDate && card.nextReviewDate <= new Date().toISOString()
    ).length;

    // Study streak calculation
    const sortedLogs = studyLogs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    let currentStreak = 0;
    let lastDate = new Date().toDateString();
    
    for (const log of sortedLogs) {
      const logDate = new Date(log.createdAt || Date.now()).toDateString();
      if (logDate === lastDate) {
        if (currentStreak === 0) currentStreak = 1;
      } else {
        const daysDiff = Math.floor((new Date(lastDate) - new Date(logDate)) / (1000 * 60 * 60 * 24));
        if (daysDiff === 1) {
          currentStreak++;
          lastDate = logDate;
        } else {
          break;
        }
      }
    }

    return {
      chartData,
      weeklyChartData,
      stats: {
        totalMinutes,
        totalHours: Math.round(totalMinutes / 60 * 10) / 10,
        averageSession,
        totalSessions: studyLogs.length,
        currentStreak,
        totalCards,
        reviewedCards,
        dueCards,
        masteredCards: totalCards - dueCards
      }
    };
  };

  const { chartData, weeklyChartData, stats } = getAnalyticsData();

  // Simple bar chart component
  const SimpleBarChart = ({ data, title }) => {
    const maxValue = Math.max(...data.map(item => item.minutes));
    
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        {data.length > 0 ? (
          <div className="space-y-2">
            {data.map(({ subject, minutes }) => (
              <div key={subject} className="flex items-center">
                <div className="w-20 text-sm text-gray-600 truncate">{subject}</div>
                <div className="flex-1 mx-3 bg-gray-200 rounded-full h-4 relative">
                  <div 
                    className="bg-blue-500 h-4 rounded-full flex items-center justify-end pr-2"
                    style={{ width: `${(minutes / maxValue) * 100}%` }}
                  >
                    <span className="text-xs text-white font-medium">{minutes}m</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-32 text-gray-500">
            <div className="text-center">
              <BarChart3 size={32} className="mx-auto mb-2 opacity-50" />
              <p>No study data yet</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Simple line chart component
  const SimpleLineChart = ({ data, title }) => {
    const maxValue = Math.max(...data.map(item => item.minutes), 1);
    
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        {data.length > 0 ? (
          <div className="h-32 flex items-end space-x-2">
            {data.map(({ date, minutes }, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div 
                  className="bg-green-500 w-full rounded-t"
                  style={{ height: `${(minutes / maxValue) * 100}%` }}
                ></div>
                <div className="text-xs text-gray-500 mt-1 truncate w-full text-center">
                  {date.split('/').slice(0, 2).join('/')}
                </div>
                <div className="text-xs text-gray-400">{minutes}m</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-32 text-gray-500">
            <div className="text-center">
              <BarChart3 size={32} className="mx-auto mb-2 opacity-50" />
              <p>No weekly data yet</p>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Study Analytics</h2>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">{stats.totalHours}h</div>
          <div className="text-sm text-gray-600">Total Study Time</div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">{stats.currentStreak}</div>
          <div className="text-sm text-gray-600">Day Streak</div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-3xl font-bold text-purple-600 mb-2">{stats.averageSession}m</div>
          <div className="text-sm text-gray-600">Avg Session</div>
        </div>
        
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div className="text-3xl font-bold text-orange-600 mb-2">{stats.masteredCards}</div>
          <div className="text-sm text-gray-600">Cards Mastered</div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <SimpleBarChart data={chartData} title="Study Time by Subject" />
        <SimpleLineChart data={weeklyChartData} title="Weekly Progress" />
      </div>

      {/* Flashcard Analytics */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h3 className="text-lg font-semibold mb-4">Flashcard Progress</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">{stats.totalCards}</div>
            <div className="text-sm text-gray-600">Total Cards</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{stats.dueCards}</div>
            <div className="text-sm text-gray-600">Due for Review</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{stats.masteredCards}</div>
            <div className="text-sm text-gray-600">Mastered</div>
          </div>
        </div>
      </div>

      {/* Study Insights */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Study Insights</h3>
        <div className="space-y-3">
          {stats.currentStreak > 0 && (
            <div className="flex items-center space-x-2">
              <Star className="text-yellow-500" size={16} />
              <span>Great job! You're on a {stats.currentStreak}-day study streak!</span>
            </div>
          )}
          {stats.averageSession < 15 && stats.totalSessions > 5 && (
            <div className="flex items-center space-x-2">
              <Clock className="text-blue-500" size={16} />
              <span>Try longer study sessions (25+ minutes) for better focus.</span>
            </div>
          )}
          {stats.dueCards > 5 && (
            <div className="flex items-center space-x-2">
              <Calendar className="text-red-500" size={16} />
              <span>You have {stats.dueCards} cards due for review!</span>
            </div>
          )}
          {stats.totalHours > 10 && (
            <div className="flex items-center space-x-2">
              <Brain className="text-purple-500" size={16} />
              <span>Amazing! You've studied for {stats.totalHours} hours total.</span>
            </div>
          )}
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
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Brain Blurts</h2>
      <p className="text-gray-600 mb-6">Quickly jot down thoughts, insights, or key concepts while studying.</p>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Quick Note</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-3 border rounded-md resize-none"
            rows="4"
            placeholder="What's on your mind? Write down any concept, insight, or question..."
          />
        </div>
        <div className="flex space-x-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-2">Subject (optional)</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full p-3 border rounded-md"
              placeholder="Math, History, etc..."
            />
          </div>
          <button
            onClick={handleSubmit}
            disabled={saving}
            className="bg-purple-500 text-white px-6 py-3 rounded-md hover:bg-purple-600 flex items-center disabled:opacity-50"
          >
            <Save className="mr-2" size={16} />
            {saving ? 'Saving...' : 'Save Blurt'}
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      {blurts.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-4 mb-6">
          <div className="flex space-x-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search notes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-md"
                />
              </div>
            </div>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-4 py-2 border rounded-md"
            >
              {subjects.map(subject => (
                <option key={subject} value={subject}>
                  {subject === 'all' ? 'All Subjects' : subject}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {filteredBlurts.length === 0 ? (
          <div className="text-center py-12">
            <Edit3 className="mx-auto mb-4 text-gray-400" size={48} />
            <p className="text-gray-500">
              {blurts.length === 0 
                ? "No brain blurts yet. Start capturing your thoughts!" 
                : "No notes match your search criteria."}
            </p>
          </div>
        ) : (
          filteredBlurts.map(blurt => (
            <div key={blurt.id} className="bg-white rounded-lg shadow-md p-4">
              <div className="flex justify-between items-start mb-2">
                <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-xs">
                  {blurt.subject}
                </span>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-gray-500">{blurt.timestamp}</span>
                  <button
                    onClick={() => onDeleteBlurt(blurt.id)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              <p className="text-gray-800 whitespace-pre-wrap">{blurt.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StudyApp;