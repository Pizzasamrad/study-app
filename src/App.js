import React, { useState, useEffect } from 'react';
import { Clock, BookOpen, Brain, Plus, Play, Pause, RotateCcw, Save, Edit3, Trash2 } from 'lucide-react';

const StudyApp = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [flashcards, setFlashcards] = useState([]);
  const [studyLogs, setStudyLogs] = useState([]);
  const [pomodoroTime, setPomodoroTime] = useState(25 * 60); // 25 minutes in seconds
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [blurts, setBlurts] = useState([]);

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
      setPomodoroTime(25 * 60);
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
    setPomodoroTime(25 * 60);
  };


  // Flashcard Management
  const addFlashcard = (front, back, subject) => {
    const newCard = {
      id: Date.now(),
      front,
      back,
      subject,
      createdAt: new Date().toLocaleDateString()
    };
    setFlashcards([...flashcards, newCard]);
  };

  const deleteFlashcard = (id) => {
    setFlashcards(flashcards.filter(card => card.id !== id));
  };

  // Study Log Management
  const addStudyLog = (subject, duration, notes) => {
    const newLog = {
      id: Date.now(),
      subject,
      duration,
      notes,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString()
    };
    setStudyLogs([...studyLogs, newLog]);
  };

  // Blurt Management
  const addBlurt = (content, subject) => {
    const newBlurt = {
      id: Date.now(),
      content,
      subject,
      timestamp: new Date().toLocaleString()
    };
    setBlurts([...blurts, newBlurt]);
  };

  const deleteBlurt = (id) => {
    setBlurts(blurts.filter(blurt => blurt.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">StudyMaster</h1>
          <p className="text-gray-600">Your personal study companion</p>
        </div>

        {/* Navigation */}
        <nav className="flex justify-center mb-8">
          <div className="bg-white rounded-lg shadow-md p-2 flex space-x-2">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: BookOpen },
              { id: 'flashcards', label: 'Flashcards', icon: Brain },
              { id: 'pomodoro', label: 'Pomodoro', icon: Clock },
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                <Brain className="mr-2 text-blue-500" />
                Flashcards
              </h3>
              <p className="text-gray-600 mb-4">Total: {flashcards.length} cards</p>
              <button
                onClick={() => setActiveTab('flashcards')}
                className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
              >
                Manage Cards
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
                <Edit3 className="mr-2 text-purple-500" />
                Brain Blurts
              </h3>
              <p className="text-gray-600 mb-4">Notes: {blurts.length} entries</p>
              <button
                onClick={() => setActiveTab('blurts')}
                className="bg-purple-500 text-white px-4 py-2 rounded-md hover:bg-purple-600 transition-colors"
              >
                Quick Note
              </button>
            </div>

            {/* Recent Study Logs */}
            <div className="md:col-span-2 lg:col-span-3 bg-white rounded-lg shadow-md p-6">
              <h3 className="text-xl font-semibold mb-4">Recent Study Sessions</h3>
              {studyLogs.length === 0 ? (
                <p className="text-gray-500">No study sessions logged yet. Start studying to track your progress!</p>
              ) : (
                <div className="space-y-2">
                  {studyLogs.slice(-5).reverse().map(log => (
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
            onAddFlashcard={addFlashcard}
            onDeleteFlashcard={deleteFlashcard}
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
      </div>
    </div>
  );
};

// Flashcards Component
const FlashcardsTab = ({ flashcards, onAddFlashcard, onDeleteFlashcard }) => {
  const [showForm, setShowForm] = useState(false);
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [subject, setSubject] = useState('');
  const [studyMode, setStudyMode] = useState(false);
  const [currentCard, setCurrentCard] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  const handleSubmit = () => {
    if (front.trim() && back.trim()) {
      onAddFlashcard(front, back, subject || 'General');
      setFront('');
      setBack('');
      setSubject('');
      setShowForm(false);
    }
  };

  const nextCard = () => {
    setShowAnswer(false);
    setCurrentCard((prev) => (prev + 1) % flashcards.length);
  };

  const prevCard = () => {
    setShowAnswer(false);
    setCurrentCard((prev) => (prev - 1 + flashcards.length) % flashcards.length);
  };

  if (studyMode && flashcards.length > 0) {
    const card = flashcards[currentCard];
    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => setStudyMode(false)}
            className="text-blue-500 hover:text-blue-700"
          >
            ← Back to Cards
          </button>
          <span className="text-gray-600">
            {currentCard + 1} of {flashcards.length}
          </span>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 min-h-64 flex flex-col justify-center items-center text-center">
          <div className="mb-4">
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
              {card.subject}
            </span>
          </div>
          
          <div className="text-xl mb-6">
            {showAnswer ? card.back : card.front}
          </div>

          <button
            onClick={() => setShowAnswer(!showAnswer)}
            className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 mb-4"
          >
            {showAnswer ? 'Show Question' : 'Show Answer'}
          </button>

          <div className="flex space-x-4">
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
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Flashcards</h2>
        <div className="space-x-4">
          {flashcards.length > 0 && (
            <button
              onClick={() => setStudyMode(true)}
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

      {showForm && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div>
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
                type="button"
                onClick={handleSubmit}
                className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600"
              >
                Add Card
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
        
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {flashcards.map(card => (
          <div key={card.id} className="bg-white rounded-lg shadow-md p-4">
            <div className="flex justify-between items-start mb-2">
              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs">
                {card.subject}
              </span>
              <button
                onClick={() => onDeleteFlashcard(card.id)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 size={16} />
              </button>
            </div>
            <div className="mb-2">
              <p className="font-semibold text-sm mb-1">Q:</p>
              <p className="text-sm text-gray-700">{card.front}</p>
            </div>
            <div className="mb-2">
              <p className="font-semibold text-sm mb-1">A:</p>
              <p className="text-sm text-gray-700">{card.back}</p>
            </div>
            <p className="text-xs text-gray-500">Created: {card.createdAt}</p>
          </div>
        ))}
      </div>

      {flashcards.length === 0 && !showForm && (
        <div className="text-center py-12">
          <Brain className="mx-auto mb-4 text-gray-400" size={48} />
          <p className="text-gray-500 mb-4">No flashcards yet. Create your first card to get started!</p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600"
          >
            Create First Card
          </button>
        </div>
      )}
    </div>
  );
};

// Pomodoro Component
const PomodoroTab = ({ time, isActive, onToggle, onReset, formatTime, onAddStudyLog }) => {
  const [subject, setSubject] = useState('');
  const [notes, setNotes] = useState('');
  const [showLogForm, setShowLogForm] = useState(false);

  const handleLogSession = () => {
    if (subject.trim()) {
      const duration = Math.round((25 * 60 - time) / 60);
      onAddStudyLog(subject, duration, notes);
      setSubject('');
      setNotes('');
      setShowLogForm(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto text-center">
      <h2 className="text-2xl font-bold mb-8">Pomodoro Timer</h2>
      
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
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold mb-4">Log Study Session</h3>
          <div>
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
                type="button"
                onClick={handleLogSession}
                className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600"
              >
                Log Session
              </button>
              <button
                type="button"
                onClick={() => setShowLogForm(false)}
                className="bg-gray-500 text-white px-6 py-2 rounded-md hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="text-left bg-gray-50 rounded-lg p-4">
        <h3 className="font-semibold mb-2">How Pomodoro Works:</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Study for 25 minutes with full focus</li>
          <li>• Take a 5-minute break when timer ends</li>
          <li>• After 4 sessions, take a longer 15-30 minute break</li>
          <li>• Log your sessions to track progress</li>
        </ul>
      </div>
    </div>
  );
};

// Brain Blurts Component  
const BlurtsTab = ({ blurts, onAddBlurt, onDeleteBlurt }) => {
  const [content, setContent] = useState('');
  const [subject, setSubject] = useState('');

  const handleSubmit = () => {
    if (content.trim()) {
      onAddBlurt(content, subject || 'General');
      setContent('');
      setSubject('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Brain Blurts</h2>
      <p className="text-gray-600 mb-6">Quickly jot down thoughts, insights, or key concepts while studying.</p>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div>
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
              type="button"
              onClick={handleSubmit}
              className="bg-purple-500 text-white px-6 py-3 rounded-md hover:bg-purple-600 flex items-center"
            >
              <Save className="mr-2" size={16} />
              Save Blurt
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {blurts.length === 0 ? (
          <div className="text-center py-12">
            <Edit3 className="mx-auto mb-4 text-gray-400" size={48} />
            <p className="text-gray-500">No brain blurts yet. Start capturing your thoughts!</p>
          </div>
        ) : (
          blurts.slice().reverse().map(blurt => (
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