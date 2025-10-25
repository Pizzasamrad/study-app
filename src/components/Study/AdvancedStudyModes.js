import React, { useState, useEffect, useMemo } from 'react';
import { 
  Type, Edit3, CheckCircle, XCircle, Play, 
  Brain, BookOpen, Lightbulb
} from 'lucide-react';
import * as storageService from '../../services/storageService';

const AdvancedStudyModes = ({ 
  flashcards, 
  onReviewFlashcard, 
  onCompleteSession,
  studyMode = 'active-recall', // active-recall, cloze, concept-explanation, review
  user = null
}) => {
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [isCorrect, setIsCorrect] = useState(null);
  const [sessionStats, setSessionStats] = useState({
    correct: 0,
    incorrect: 0,
    total: 0,
    streak: 0,
    maxStreak: 0
  });
  const [sessionComplete, setSessionComplete] = useState(false);
  const [studyCards, setStudyCards] = useState([]);
  const [clozeText, setClozeText] = useState('');
  const [clozeAnswer, setClozeAnswer] = useState('');
  const [sessionType, setSessionType] = useState('review'); // review, learn, test
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Filter and prepare cards based on study mode and session type
  const filteredCards = useMemo(() => {
    if (sessionType === 'review') {
      // Show cards that need review (due cards)
      const now = new Date();
      return flashcards.filter(card => 
        card.nextReviewDate && card.nextReviewDate <= now.toISOString()
      );
    } else if (sessionType === 'learn') {
      // Show new cards or cards with low review count
      return flashcards.filter(card => card.reviewCount < 3);
    } else {
      // Test mode - show all cards
      return flashcards;
    }
  }, [flashcards, sessionType]);

  // Initialize study session
  useEffect(() => {
    if (filteredCards.length > 0) {
      setStudyCards([...filteredCards].sort(() => Math.random() - 0.5));
      setSessionStats(prev => ({ ...prev, total: filteredCards.length }));
      setIsTimerRunning(true);
      setCurrentCardIndex(0); // Reset to first card
    } else {
      setStudyCards([]);
      setSessionStats({ correct: 0, incorrect: 0, total: 0, streak: 0, maxStreak: 0 });
      setIsTimerRunning(false);
      setCurrentCardIndex(0);
    }
  }, [filteredCards]);

  // Timer effect
  useEffect(() => {
    let interval;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // Save concept explanation
  const saveConceptExplanation = async (cardId, explanation) => {
    try {
      const explanationData = {
        id: Date.now().toString(),
        cardId,
        explanation,
        timestamp: new Date().toISOString(),
        question: currentCard.front,
        answer: currentCard.back
      };
      
      // Save to storage using the proper function
      if (user) {
        await storageService.saveConceptExplanation(explanationData);
      } else {
        await storageService.saveConceptExplanation(explanationData);
      }
      
      console.log('Concept explanation saved:', explanationData);
    } catch (error) {
      console.error('Error saving concept explanation:', error);
    }
  };

  // Generate cloze deletion using highlighted words
  const generateClozeDeletion = (text, highlightedWords = []) => {
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
      
      const randomWord = keyWords[Math.floor(Math.random() * keyWords.length)];
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
    
    // Randomly select one of the highlighted words
    const selectedWord = availableWords[Math.floor(Math.random() * availableWords.length)];
    const clozeText = text.replace(new RegExp(selectedWord, 'gi'), '_____');
    
    return { text: clozeText, answer: selectedWord };
  };

  // Check answer based on study mode
  const checkAnswer = () => {
    const currentCard = studyCards[currentCardIndex];
    if (!currentCard || !userAnswer.trim()) return;
    
    let correct = false;

    if (studyMode === 'active-recall') {
      // Fuzzy matching for active recall
      const userAnswerLower = userAnswer.toLowerCase().trim();
      const correctAnswerLower = currentCard.back.toLowerCase().trim();
      
      // Check for exact match or contains
      correct = userAnswerLower === correctAnswerLower || 
                correctAnswerLower.includes(userAnswerLower) ||
                userAnswerLower.includes(correctAnswerLower);
    } else if (studyMode === 'cloze') {
      correct = userAnswer.toLowerCase().trim() === clozeAnswer.toLowerCase().trim();
    } else if (studyMode === 'concept-explanation') {
      // For concept explanation, we don't mark as correct/incorrect
      // Instead, we save the explanation and always proceed
      correct = true; // Always count as "correct" for stats
      
      // Save the explanation
      saveConceptExplanation(currentCard.id, userAnswer);
    }

    setIsCorrect(correct);
    setShowAnswer(true);
    
    // Update session stats
    setSessionStats(prev => {
      const newStats = {
        ...prev,
        correct: correct ? prev.correct + 1 : prev.correct,
        incorrect: correct ? prev.incorrect : prev.incorrect + 1,
        streak: correct ? prev.streak + 1 : 0,
        maxStreak: correct ? Math.max(prev.maxStreak, prev.streak + 1) : prev.maxStreak
      };
      return newStats;
    });
  };

  // Handle next card
  const nextCard = () => {
    if (currentCardIndex < studyCards.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
      setUserAnswer('');
      setShowAnswer(false);
      setIsCorrect(null);
      
      // Prepare next card based on mode
      const nextCard = studyCards[currentCardIndex + 1];
      if (nextCard && studyMode === 'cloze') {
        const cloze = generateClozeDeletion(nextCard.back, nextCard.highlightedWords || []);
        setClozeText(cloze.text);
        setClozeAnswer(cloze.answer);
      }
    } else {
      // Session complete
      setSessionComplete(true);
      setIsTimerRunning(false);
      if (onCompleteSession) {
        onCompleteSession({
          ...sessionStats,
          duration: timer,
          mode: studyMode,
          type: sessionType
        });
      }
    }
  };

  // Handle card review
  const handleReview = async (difficulty) => {
    const currentCard = studyCards[currentCardIndex];
    if (!currentCard || !onReviewFlashcard) return;
    
    try {
      await onReviewFlashcard(currentCard.id, difficulty);
      nextCard();
    } catch (error) {
      console.error('Error reviewing card:', error);
      // Still proceed to next card even if review fails
      nextCard();
    }
  };

  // Initialize current card
  useEffect(() => {
    if (studyCards.length > 0 && currentCardIndex < studyCards.length) {
      const currentCard = studyCards[currentCardIndex];
      if (studyMode === 'cloze') {
        const cloze = generateClozeDeletion(currentCard.back, currentCard.highlightedWords || []);
        setClozeText(cloze.text);
        setClozeAnswer(cloze.answer);
      }
    }
  }, [currentCardIndex, studyCards, studyMode]);

  if (filteredCards.length === 0) {
    return (
      <div className="bg-gradient-to-br from-blue-500/20 to-cyan-600/20 backdrop-blur-xl rounded-3xl border border-white/20 p-8 shadow-2xl text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h3 className="text-2xl font-bold text-white mb-4">No Cards to Study!</h3>
        <p className="text-blue-200 mb-6">
          {studyMode === 'review' ? 'All cards are up to date!' : 
           studyMode === 'learn' ? 'No new cards to learn!' : 
           'No cards available for testing!'}
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-2xl font-bold hover:from-blue-600 hover:to-cyan-600 transition-all duration-300"
        >
          🔄 Refresh
        </button>
      </div>
    );
  }

  if (sessionComplete) {
    const accuracy = Math.round((sessionStats.correct / sessionStats.total) * 100);
    const minutes = Math.floor(timer / 60);
    const seconds = timer % 60;

    return (
      <div className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 backdrop-blur-xl rounded-3xl border border-white/20 p-8 shadow-2xl">
        <div className="text-center">
          <div className="text-6xl mb-4">🏆</div>
          <h3 className="text-3xl font-bold text-white mb-6">Session Complete!</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/10 rounded-2xl p-6">
              <div className="text-3xl font-black text-white mb-2">{accuracy}%</div>
              <div className="text-green-200 font-bold">Accuracy</div>
            </div>
            <div className="bg-white/10 rounded-2xl p-6">
              <div className="text-3xl font-black text-white mb-2">{sessionStats.maxStreak}</div>
              <div className="text-blue-200 font-bold">Best Streak</div>
            </div>
            <div className="bg-white/10 rounded-2xl p-6">
              <div className="text-3xl font-black text-white mb-2">{minutes}:{seconds.toString().padStart(2, '0')}</div>
              <div className="text-purple-200 font-bold">Time</div>
            </div>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => {
                setSessionComplete(false);
                setCurrentCardIndex(0);
                setUserAnswer('');
                setShowAnswer(false);
                setIsCorrect(null);
                setSessionStats({ correct: 0, incorrect: 0, total: studyCards.length, streak: 0, maxStreak: 0 });
                setTimer(0);
                setIsTimerRunning(true);
              }}
              className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-8 py-4 rounded-2xl font-bold hover:from-green-600 hover:to-emerald-600 transition-all duration-300 mr-4"
            >
              <Play className="inline mr-2" size={20} />
              Study Again
            </button>
            <button
              onClick={() => {
                if (onCompleteSession) {
                  onCompleteSession({
                    ...sessionStats,
                    duration: timer,
                    mode: studyMode,
                    type: sessionType
                  });
                }
              }}
              className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-8 py-4 rounded-2xl font-bold hover:from-blue-600 hover:to-cyan-600 transition-all duration-300"
            >
              <BookOpen className="inline mr-2" size={20} />
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentCard = studyCards[currentCardIndex];
  const progress = studyCards.length > 0 ? ((currentCardIndex + 1) / studyCards.length) * 100 : 0;

  // Safety check - if no current card, show loading or error
  if (!currentCard) {
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-gradient-to-br from-blue-500/20 to-cyan-600/20 backdrop-blur-xl rounded-3xl border border-white/20 p-8 shadow-2xl text-center">
          <div className="text-6xl mb-4">🔄</div>
          <h3 className="text-2xl font-bold text-white mb-4">Loading Study Session...</h3>
          <p className="text-blue-200 mb-6">Preparing your study materials</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {studyMode === 'review' ? (
        // Review Mode - Exact replica of old flashcard UI
        <div className="space-y-6">
          {/* Navigation Header */}
          <div className="flex justify-between items-center">
            <button 
              onClick={() => {
                if (onCompleteSession) {
                  onCompleteSession({
                    ...sessionStats,
                    duration: timer,
                    mode: studyMode,
                    type: 'review'
                  });
                }
              }}
              className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-6 py-3 rounded-2xl hover:from-gray-600 hover:to-gray-700 transition-all duration-300 font-bold shadow-lg hover:shadow-gray-500/50 transform hover:scale-105"
            >
              ⬅️ Back to Dashboard
            </button>
            <span className="text-white font-bold text-lg">
              📊 {currentCardIndex + 1} of {studyCards.length} 🔥 (Due for Review)
            </span>
          </div>

          {/* Flashcard */}
          <div className="bg-gradient-to-br from-blue-500/20 to-cyan-600/20 backdrop-blur-xl rounded-3xl border border-white/20 p-12 min-h-96 flex flex-col justify-center items-center text-center shadow-2xl">
            <div className="mb-6 flex flex-wrap items-center justify-center gap-3">
              <span className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-4 py-2 rounded-full font-bold">
                📚 {currentCard.subject || 'General'}
              </span>
              {currentCard.reviewCount > 0 && (
                <span className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 rounded-full font-bold">
                  ⭐ Reviewed {currentCard.reviewCount} times
                </span>
              )}
            </div>
            
            <div className="text-2xl font-bold text-white mb-8 min-h-24 flex items-center justify-center leading-relaxed max-w-2xl">
              {showAnswer ? `💡 ${currentCard.back}` : `❓ ${currentCard.front}`}
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
                    onClick={() => handleReview(1)}
                    className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-8 py-4 rounded-2xl hover:from-red-600 hover:to-pink-700 transition-all duration-300 font-bold shadow-lg hover:shadow-red-500/50 transform hover:scale-105"
                  >
                    😰 Hard
                  </button>
                  <button 
                    onClick={() => handleReview(3)}
                    className="bg-gradient-to-r from-yellow-500 to-orange-600 text-white px-8 py-4 rounded-2xl hover:from-yellow-600 hover:to-orange-700 transition-all duration-300 font-bold shadow-lg hover:shadow-yellow-500/50 transform hover:scale-105"
                  >
                    🤔 Medium
                  </button>
                  <button 
                    onClick={() => handleReview(5)}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-2xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 font-bold shadow-lg hover:shadow-green-500/50 transform hover:scale-105"
                  >
                    😎 Easy
                  </button>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <button 
                onClick={() => {
                  if (currentCardIndex > 0) {
                    setCurrentCardIndex(currentCardIndex - 1);
                    setShowAnswer(false);
                  }
                }}
                disabled={currentCardIndex === 0}
                className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-8 py-3 rounded-2xl hover:from-gray-600 hover:to-gray-700 transition-all duration-300 font-bold shadow-lg hover:shadow-gray-500/50 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ⬅️ Previous
              </button>
              <button 
                onClick={() => {
                  if (currentCardIndex < studyCards.length - 1) {
                    setCurrentCardIndex(currentCardIndex + 1);
                    setShowAnswer(false);
                  }
                }}
                disabled={currentCardIndex === studyCards.length - 1}
                className="bg-gradient-to-r from-gray-500 to-gray-600 text-white px-8 py-3 rounded-2xl hover:from-gray-600 hover:to-gray-700 transition-all duration-300 font-bold shadow-lg hover:shadow-gray-500/50 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next ➡️
              </button>
            </div>
          </div>
        </div>
      ) : (
        // Other Study Modes - Keep existing UI
        <>
          {/* Session Header */}
          <div className="bg-gradient-to-br from-purple-500/20 to-indigo-600/20 backdrop-blur-xl rounded-3xl border border-white/20 p-6 shadow-2xl">
            <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-4 lg:space-y-0">
              <div>
                <h2 className="text-3xl font-black text-white mb-2 flex items-center">
                  {studyMode === 'active-recall' && <Type className="mr-3" size={28} />}
                  {studyMode === 'cloze' && <Edit3 className="mr-3" size={28} />}
                  {studyMode === 'concept-explanation' && <Lightbulb className="mr-3" size={28} />}
                </h2>
                <p className="text-white/80">
                  {studyMode === 'active-recall' && 'Type your answers to strengthen memory'}
                  {studyMode === 'cloze' && 'Fill in the blanks to test understanding'}
                  {studyMode === 'concept-explanation' && 'Explain why the answer is correct'}
                </p>
              </div>
              
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-2xl font-black text-white">{currentCardIndex + 1}/{studyCards.length}</div>
                  <div className="text-sm text-white/70">Cards</div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black text-white">{Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}</div>
                  <div className="text-sm text-white/70">Time</div>
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-6">
              <div className="flex justify-between text-sm text-white/70 mb-2">
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-green-400 to-emerald-500 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>

            {/* Session Stats */}
            <div className="flex justify-center space-x-6 mt-6">
              <div className="text-center">
                <div className="text-xl font-bold text-green-400">{sessionStats.correct}</div>
                <div className="text-xs text-white/70">Correct</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-red-400">{sessionStats.incorrect}</div>
                <div className="text-xs text-white/70">Incorrect</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-blue-400">{sessionStats.streak}</div>
                <div className="text-xs text-white/70">Streak</div>
              </div>
            </div>
          </div>

          {/* Study Card */}
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl rounded-3xl border border-white/20 p-8 shadow-2xl">
            <div className="text-center mb-8">
              <h3 className="text-2xl font-bold text-white mb-4">Question {currentCardIndex + 1}</h3>
              
              {/* Question Display */}
              <div className="bg-white/10 rounded-2xl p-6 mb-6">
                {studyMode === 'cloze' ? (
                  <div>
                    <p className="text-white/80 text-sm mb-3">Question:</p>
                    <p className="text-xl text-white font-medium mb-4">{currentCard.front}</p>
                    <p className="text-white/80 text-sm mb-3">Fill in the blank:</p>
                    <p className="text-xl text-white font-medium">{clozeText}</p>
                  </div>
                ) : (
                  <p className="text-xl text-white font-medium">
                    {currentCard.front}
                  </p>
                )}
                {studyMode === 'concept-explanation' && (
                  <div className="mt-4 p-4 bg-blue-500/20 rounded-xl border border-blue-400/30">
                    <p className="text-blue-200 text-sm font-medium mb-2">Answer:</p>
                    <p className="text-white font-semibold">{currentCard.back}</p>
                  </div>
                )}
              </div>

          {/* Answer Input */}
          {!showAnswer && (
            <div className="space-y-4">
              {studyMode === 'active-recall' && (
                <div>
                  <label className="block text-white/80 mb-2 text-left">Type your answer:</label>
                  <input
                    type="text"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && checkAnswer()}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Enter your answer..."
                    autoFocus
                  />
                </div>
              )}

              {studyMode === 'cloze' && (
                <div>
                  <label className="block text-white/80 mb-2 text-left">Fill in the blank:</label>
                  <input
                    type="text"
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && checkAnswer()}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    placeholder="Type the missing word..."
                    autoFocus
                  />
                </div>
              )}

              {studyMode === 'concept-explanation' && (
                <div>
                  <label className="block text-white/80 mb-2 text-left">Explain why this answer is correct:</label>
                  <textarea
                    value={userAnswer}
                    onChange={(e) => setUserAnswer(e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-400 min-h-[120px] resize-none"
                    placeholder="Explain the reasoning, concepts, or principles that make this answer correct..."
                    autoFocus
                  />
                </div>
              )}

              <button
                onClick={checkAnswer}
                disabled={!userAnswer.trim()}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-8 py-3 rounded-2xl font-bold hover:from-blue-600 hover:to-cyan-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <CheckCircle className="inline mr-2" size={20} />
                Check Answer
              </button>
            </div>
          )}

          {/* Answer Display */}
          {showAnswer && (
            <div className="space-y-6">
              <div className={`p-6 rounded-2xl border-2 ${
                isCorrect 
                  ? 'border-green-400 bg-green-500/20' 
                  : 'border-red-400 bg-red-500/20'
              }`}>
                <div className="flex items-center justify-center mb-4">
                  {isCorrect ? (
                    <CheckCircle className="text-green-400 mr-2" size={24} />
                  ) : (
                    <XCircle className="text-red-400 mr-2" size={24} />
                  )}
                  <span className={`text-xl font-bold ${
                    isCorrect ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {isCorrect ? 'Correct!' : 'Incorrect'}
                  </span>
                </div>
                
                <div className="text-center">
                  <p className="text-white/80 mb-2">Your answer:</p>
                  <p className="text-white font-medium mb-4 whitespace-pre-wrap text-left">{userAnswer}</p>
                  {studyMode === 'concept-explanation' && (
                    <div className="mt-4 p-4 bg-green-500/20 rounded-xl border border-green-400/30">
                      <p className="text-green-200 text-sm font-medium mb-2">Explanation saved!</p>
                      <p className="text-white text-sm">You can review your explanations later.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Difficulty Rating */}
              <div className="space-y-4">
                <p className="text-white/80 text-center">How well did you know this?</p>
                <div className="flex justify-center space-x-3">
                  {[1, 2, 3, 4, 5].map((difficulty) => (
                    <button
                      key={difficulty}
                      onClick={() => handleReview(difficulty)}
                      className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-2 rounded-xl font-bold hover:from-yellow-600 hover:to-orange-600 transition-all duration-300"
                    >
                      {difficulty}
                    </button>
                  ))}
                </div>
                <div className="flex justify-center space-x-8 text-xs text-white/60">
                  <span>Hard</span>
                  <span>Easy</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
        </>
      )}
    </div>
  );
};

export default AdvancedStudyModes;
