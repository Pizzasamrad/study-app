import React from 'react';
import { Brain, Clock, BarChart3, BookOpen, TrendingUp, Target, Zap, Trophy, Star, Calendar, Edit3 } from 'lucide-react';
import LevelProgress from './LevelProgress';


const DashboardTab = ({ 
  flashcards, 
  studyLogs, 
  availableCategories, 
  streakData, 
  onTabChange,
  blurts
}) => {
  const totalStudyTime = studyLogs.reduce((sum, log) => sum + log.duration, 0);
  const totalStudyHours = Math.round((totalStudyTime / 60) * 10) / 10;
  const averageSessionTime = studyLogs.length > 0 ? Math.round(totalStudyTime / studyLogs.length) : 0;
  const reviewedCards = flashcards.filter(card => card.reviewCount > 0).length;
  const completionRate = flashcards.length > 0 ? Math.round((reviewedCards / flashcards.length) * 100) : 100;

  return (
    <div className="max-w-7xl mx-auto px-6 space-y-8">
      {/* Welcome Section */}
      <div className="text-center mb-8">
        <h2 className="text-6xl font-black text-amber-400 mb-4 font-mono tracking-wider">
          DUNGEON_MASTER
        </h2>
        <p className="text-amber-300 text-lg font-mono">
          {'>'} PREPARING KNOWLEDGE QUEST...
        </p>
        <div className="mt-6 flex items-center justify-center space-x-6 text-sm font-mono">
          <div className="flex items-center space-x-2 bg-amber-900/30 px-4 py-2 border border-amber-400/50">
            <div className="w-2 h-2 bg-amber-400 rounded-full animate-pulse"></div>
            <span className="text-amber-400">ADVENTURE READY</span>
          </div>
          <div className="flex items-center space-x-2 bg-orange-900/30 px-4 py-2 border border-orange-400/50">
            <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"></div>
            <span className="text-orange-400">QUEST ACTIVE</span>
          </div>
        </div>
      </div>

      {/* Level Progress */}
      <LevelProgress 
        studyLogs={studyLogs}
        flashcards={flashcards}
        blurts={blurts}
        streakData={streakData}
      />

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Flashcards Card */}
        <div className="group bg-gradient-to-br from-amber-900/30 to-black/50 backdrop-blur-xl rounded-lg border-2 border-amber-400/50 p-6 hover:shadow-2xl hover:shadow-amber-500/25 transition-all duration-300 transform hover:-translate-y-2 hover:scale-105 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/5 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          <div className="absolute top-2 right-2 w-3 h-3 bg-amber-400 rounded-full animate-pulse"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-amber-600 to-orange-800 rounded-lg shadow-lg group-hover:animate-bounce relative">
                <Brain className="text-white" size={24} />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full animate-ping"></div>
              </div>
              <div className="text-right">
                <p className="text-4xl font-black text-amber-400 drop-shadow-lg font-mono">{flashcards.length}</p>
                <p className="text-sm text-amber-300 font-mono">SCROLLS</p>
              </div>
            </div>
            <h3 className="text-xl font-bold text-amber-400 mb-2 flex items-center space-x-2 font-mono">
              <span>⚔️</span>
              <span>KNOWLEDGE_VAULT</span>
            </h3>
            <p className="text-amber-300 mb-4 text-sm font-mono">
              {reviewedCards > 0 ? `> ${reviewedCards} SCROLLS MASTERED` : '> AWAITING QUEST...'}
            </p>
            <div className="w-full bg-black/50 border border-amber-400/30 rounded h-3 mb-4">
              <div 
                className="bg-gradient-to-r from-amber-400 to-orange-500 h-3 rounded transition-all duration-500"
                style={{ width: `${completionRate}%` }}
              ></div>
            </div>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onTabChange('flashcards');
              }}
              className="w-full bg-gradient-to-r from-amber-600 to-orange-700 text-white py-3 rounded border-2 border-amber-400 hover:from-amber-700 hover:to-orange-800 transition-all duration-300 font-mono font-bold shadow-lg hover:shadow-amber-500/50 transform hover:scale-105 flex items-center justify-center space-x-2"
              style={{ touchAction: 'manipulation' }}
            >
              <Zap size={16} />
              <span>{'>'} BEGIN QUEST</span>
            </button>
          </div>
        </div>

        {/* Study Sessions Card */}
        <div className="group bg-gradient-to-br from-amber-900/30 to-black/50 backdrop-blur-xl rounded-lg border-2 border-amber-400/50 p-6 hover:shadow-2xl hover:shadow-amber-500/25 transition-all duration-300 transform hover:-translate-y-2 hover:scale-105 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/5 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-amber-600 to-orange-700 rounded-lg shadow-lg group-hover:animate-spin">
                <Clock className="text-white" size={24} />
              </div>
              <div className="text-right">
                <p className="text-3xl font-black text-amber-400 drop-shadow-lg font-mono">{studyLogs.length}</p>
                <p className="text-sm text-amber-300 font-mono">QUESTS</p>
              </div>
            </div>
            <h3 className="text-xl font-bold text-amber-400 mb-2 flex items-center space-x-2 font-mono">
              <span>⏰</span>
              <span>QUEST LOG</span>
            </h3>
            <p className="text-amber-300 mb-4 text-sm font-mono">
              {studyLogs.length > 0 ? `> ${averageSessionTime} MIN AVG QUEST` : '> BEGIN YOUR FIRST QUEST'}
            </p>
            <div className="flex items-center space-x-2 mb-4">
              <TrendingUp className="text-amber-400" size={16} />
              <span className="text-amber-300 text-sm font-mono">{totalStudyHours}h TOTAL QUEST TIME</span>
            </div>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onTabChange('pomodoro');
              }}
              className="w-full bg-gradient-to-r from-amber-600 to-orange-700 text-white py-3 rounded border-2 border-amber-400 hover:from-amber-700 hover:to-orange-800 transition-all duration-300 font-mono font-bold shadow-lg hover:shadow-amber-500/50 transform hover:scale-105 flex items-center justify-center space-x-2"
              style={{ touchAction: 'manipulation' }}
            >
              <Clock size={16} />
              <span>{'>'} START QUEST</span>
            </button>
          </div>
        </div>

        {/* Analytics Card */}
        <div className="group bg-gradient-to-br from-amber-900/30 to-black/50 backdrop-blur-xl rounded-lg border-2 border-amber-400/50 p-6 hover:shadow-2xl hover:shadow-amber-500/25 transition-all duration-300 transform hover:-translate-y-2 hover:scale-105 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/5 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-amber-600 to-orange-700 rounded-lg shadow-lg group-hover:animate-pulse">
                <BarChart3 className="text-white" size={24} />
              </div>
              <div className="text-right">
                <p className="text-3xl font-black text-amber-400 drop-shadow-lg font-mono">{totalStudyHours}</p>
                <p className="text-sm text-amber-300 font-mono">HOURS</p>
              </div>
            </div>
            <h3 className="text-xl font-bold text-amber-400 mb-2 flex items-center space-x-2 font-mono">
              <span>📊</span>
              <span>QUEST STATS</span>
            </h3>
            <p className="text-amber-300 mb-4 text-sm font-mono">
              {studyLogs.length > 0 ? '> TRACK YOUR QUEST PROGRESS' : '> NO QUEST DATA YET'}
            </p>
            <div className="flex items-center space-x-2 mb-4">
              <Star className="text-amber-400" size={16} />
              <span className="text-amber-300 text-sm font-mono">DETAILED INSIGHTS AVAILABLE</span>
            </div>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onTabChange('analytics');
              }}
              className="w-full bg-gradient-to-r from-amber-600 to-orange-700 text-white py-3 rounded border-2 border-amber-400 hover:from-amber-700 hover:to-orange-800 transition-all duration-300 font-mono font-bold shadow-lg hover:shadow-amber-500/50 transform hover:scale-105 flex items-center justify-center space-x-2"
              style={{ touchAction: 'manipulation' }}
            >
              <BarChart3 size={16} />
              <span>{'>'} VIEW STATS</span>
            </button>
          </div>
        </div>

        {/* Advanced Study Card */}
        <div className="group bg-gradient-to-br from-amber-900/30 to-black/50 backdrop-blur-xl rounded-lg border-2 border-amber-400/50 p-6 hover:shadow-2xl hover:shadow-amber-500/25 transition-all duration-300 transform hover:-translate-y-2 hover:scale-105 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/5 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-amber-600 to-orange-700 rounded-lg shadow-lg group-hover:animate-bounce">
                <Target className="text-white" size={24} />
              </div>
              <div className="text-right">
                <p className="text-3xl font-black text-amber-400 drop-shadow-lg font-mono">4</p>
                <p className="text-sm text-amber-300 font-mono">MODES</p>
              </div>
            </div>
            <h3 className="text-xl font-bold text-amber-400 mb-2 flex items-center space-x-2 font-mono">
              <span>🎯</span>
              <span>ADVANCED QUEST</span>
            </h3>
            <p className="text-amber-300 mb-4 text-sm font-mono">
              {'>'} ACTIVE RECALL, DECIPHER, RECALL & MORE
            </p>
            <div className="flex items-center space-x-2 mb-4">
              <Trophy className="text-amber-400" size={16} />
              <span className="text-amber-300 text-sm font-mono">PRO LEARNING TECHNIQUES</span>
            </div>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onTabChange('study');
              }}
              className="w-full bg-gradient-to-r from-amber-600 to-orange-700 text-white py-3 rounded border-2 border-amber-400 hover:from-amber-700 hover:to-orange-800 transition-all duration-300 font-mono font-bold shadow-lg hover:shadow-amber-500/50 transform hover:scale-105 flex items-center justify-center space-x-2"
              style={{ touchAction: 'manipulation' }}
            >
              <Target size={16} />
              <span>{'>'} START LEARNING</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Quick Actions */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
            <Zap className="mr-3 text-yellow-400" size={24} />
            Quick Actions
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onTabChange('flashcards');
              }}
              className="bg-gradient-to-r from-amber-600/20 to-orange-700/20 border-2 border-amber-400/50 p-4 rounded-lg hover:from-amber-600/30 hover:to-orange-700/30 transition-all duration-300 group"
              style={{ touchAction: 'manipulation' }}
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-amber-600/20 rounded-lg group-hover:bg-amber-600/30 transition-colors">
                  <Brain size={20} className="text-amber-400" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-white">Add Card</div>
                  <div className="text-xs text-amber-300 font-mono">CREATE NEW SCROLL</div>
                </div>
              </div>
            </button>
            
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onTabChange('pomodoro');
              }}
              className="bg-gradient-to-r from-green-500/20 to-teal-600/20 border border-green-500/30 p-4 rounded-xl hover:from-green-500/30 hover:to-teal-600/30 transition-all duration-300 group"
              style={{ touchAction: 'manipulation' }}
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-500/20 rounded-lg group-hover:bg-green-500/30 transition-colors">
                  <Clock size={20} className="text-green-400" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-white">Start Timer</div>
                  <div className="text-xs text-green-200">Begin study session</div>
                </div>
              </div>
            </button>
            
            
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onTabChange('blurts');
              }}
              className="bg-gradient-to-r from-yellow-500/20 to-orange-600/20 border border-yellow-500/30 p-4 rounded-xl hover:from-yellow-500/30 hover:to-orange-600/30 transition-all duration-300 group"
              style={{ touchAction: 'manipulation' }}
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-yellow-500/20 rounded-lg group-hover:bg-yellow-500/30 transition-colors">
                  <Edit3 size={20} className="text-yellow-400" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-white">Quick Note</div>
                  <div className="text-xs text-yellow-200">Capture thoughts</div>
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
            <Calendar className="mr-3 text-blue-400" size={24} />
            Recent Activity
          </h3>
          {studyLogs.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-6xl mb-4">📖</div>
              <p className="text-white/80 mb-4">No study sessions logged yet.</p>
              <p className="text-white/60 text-sm">Start studying to track your progress!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {studyLogs.slice(0, 5).map((log, index) => (
                <div key={log.id} className="bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-4 hover:bg-white/10 transition-all duration-200 group">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h4 className="font-bold text-white text-lg mb-1 flex items-center">
                        <BookOpen className="mr-2 text-blue-400" size={16} />
                        {log.subject}
                      </h4>
                      <p className="text-white/80 font-medium text-sm">
                        ⏰ {log.duration} minutes - {log.date} at {log.time}
                      </p>
                      {log.notes && (
                        <p className="text-white/70 mt-2 italic text-sm">💭 {log.notes}</p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-white/60">{index === 0 ? 'Today' : index === 1 ? 'Yesterday' : `${index + 1} days ago`}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardTab;
