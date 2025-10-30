import React, { useState } from 'react';
import { 
  Type, Edit3, Target, BookOpen, Brain, Zap, Star, Clock,
  TrendingUp, Award, Flame, Lightbulb, Play, Settings, CheckCircle
} from 'lucide-react';

const StudyModeSelector = ({ onModeSelect, onStartSession, flashcards = [] }) => {
  const [selectedMode, setSelectedMode] = useState('active-recall');

  const studyModes = [
    {
      id: 'active-recall',
      name: 'Active Recall',
      icon: Type,
      description: 'Type your answers to strengthen memory retention',
      benefits: ['Better long-term retention', 'Identifies knowledge gaps', 'Active learning'],
      color: 'from-amber-600 to-orange-700',
      bgColor: 'from-amber-600/20 to-orange-700/20'
    },
    {
      id: 'cloze',
      name: 'Cloze Deletion',
      icon: Edit3,
      description: 'Fill in the blanks to test understanding',
      benefits: ['Tests comprehension', 'Context-based learning', 'Vocabulary building'],
      color: 'from-green-500 to-emerald-500',
      bgColor: 'from-green-500/20 to-emerald-600/20'
    },
    {
      id: 'concept-explanation',
      name: 'Concept Explanation',
      icon: Lightbulb,
      description: 'Explain why the answer is correct',
      benefits: ['Deep understanding', 'Conceptual learning', 'Review explanations'],
      color: 'from-amber-600 to-orange-700',
      bgColor: 'from-amber-600/20 to-orange-700/20'
    },
    {
      id: 'review',
      name: 'Flashcard Review',
      icon: BookOpen,
      description: 'Traditional flashcard review with spaced repetition',
      benefits: ['Familiar interface', 'Spaced repetition', 'Quick review'],
      color: 'from-orange-500 to-red-500',
      bgColor: 'from-orange-500/20 to-red-600/20'
    }
  ];



  const handleModeSelect = (modeId) => {
    setSelectedMode(modeId);
    if (onModeSelect) {
      onModeSelect(modeId);
    }
  };

  const handleStartSession = () => {
    if (onStartSession) {
      onStartSession(selectedMode, 'review');
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Dungeon Header */}
      <div className="bg-gradient-to-br from-amber-900/20 to-black/50 backdrop-blur-xl rounded-lg border-2 border-amber-400/50 p-8 shadow-2xl text-center">
        <h2 className="text-4xl font-black text-white mb-4 flex items-center justify-center">
          <Brain className="mr-3" size={36} />
          Choose Your Study Mode
        </h2>
        <p className="text-white/80 text-lg max-w-2xl mx-auto">
          Select the learning technique that works best for you. Each mode uses different cognitive strategies to enhance your learning experience.
        </p>
      </div>

      {/* Study Modes */}
      <div className="space-y-6">
        <h3 className="text-2xl font-bold text-white text-center mb-6">Learning Techniques</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {studyModes.map((mode) => {
            const Icon = mode.icon;
            return (
              <div
                key={mode.id}
                onClick={() => handleModeSelect(mode.id)}
                className={`bg-gradient-to-br ${mode.bgColor} backdrop-blur-xl rounded-3xl border-2 transition-all duration-300 cursor-pointer hover:scale-105 ${
                  selectedMode === mode.id 
                    ? 'border-white/40 shadow-2xl' 
                    : 'border-white/20 hover:border-white/30'
                }`}
              >
                <div className="p-6">
                  <div className="flex items-center mb-4">
                    <div className={`p-3 bg-gradient-to-r ${mode.color} rounded-2xl mr-4`}>
                      <Icon className="text-white" size={24} />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-white">{mode.name}</h4>
                      <p className="text-white/70 text-sm">{mode.description}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-white/80 text-sm font-medium">Benefits:</p>
                    <ul className="space-y-1">
                      {mode.benefits.map((benefit, index) => (
                        <li key={index} className="text-white/60 text-sm flex items-center">
                          <Star className="text-yellow-400 mr-2" size={12} />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {selectedMode === mode.id && (
                    <div className="mt-4 p-3 bg-white/10 rounded-2xl border border-white/20">
                      <div className="flex items-center text-white/80 text-sm">
                        <CheckCircle className="mr-2" size={16} />
                        Selected
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>



      {/* Study Tips */}
      <div className="bg-gradient-to-br from-yellow-500/20 to-orange-600/20 backdrop-blur-xl rounded-3xl border border-white/20 p-6 shadow-2xl">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center">
          <Lightbulb className="mr-3" size={24} />
          Study Tips
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center text-white/80">
              <Zap className="text-yellow-400 mr-2" size={16} />
              <span className="text-sm">Study in short, focused sessions</span>
            </div>
            <div className="flex items-center text-white/80">
              <Clock className="text-blue-400 mr-2" size={16} />
              <span className="text-sm">Take breaks every 25 minutes</span>
            </div>
            <div className="flex items-center text-white/80">
              <TrendingUp className="text-green-400 mr-2" size={16} />
              <span className="text-sm">Review difficult cards more often</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center text-white/80">
              <Award className="text-purple-400 mr-2" size={16} />
              <span className="text-sm">Celebrate your progress</span>
            </div>
            <div className="flex items-center text-white/80">
              <Flame className="text-red-400 mr-2" size={16} />
              <span className="text-sm">Maintain your study streak</span>
            </div>
            <div className="flex items-center text-white/80">
              <Brain className="text-indigo-400 mr-2" size={16} />
              <span className="text-sm">Mix different study modes</span>
            </div>
          </div>
        </div>
      </div>

      {/* Start Session Button */}
      <div className="text-center">
        <button
          onClick={handleStartSession}
          disabled={flashcards.length === 0}
          className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-12 py-4 rounded-2xl font-bold text-lg hover:from-green-600 hover:to-emerald-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-2xl hover:shadow-green-500/25 transform hover:-translate-y-1"
        >
          <Play className="inline mr-3" size={24} />
          Start Study Session
        </button>
        
        {flashcards.length === 0 && (
          <p className="text-white/60 mt-4">
            No cards available. Try creating some flashcards first!
          </p>
        )}
      </div>
    </div>
  );
};

export default StudyModeSelector;
