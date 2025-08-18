import React from 'react';
import { Brain, Clock, BarChart3, BookOpen, TrendingUp, Target, Zap, Trophy, Star, Calendar, Edit3 } from 'lucide-react';
import LevelProgress from './LevelProgress';


const DashboardTab = ({ 
  flashcards, 
  studyLogs, 
  dueCards, 
  streakData, 
  onTabChange,
  blurts
}) => {
  const totalStudyTime = studyLogs.reduce((sum, log) => sum + log.duration, 0);
  const totalStudyHours = Math.round((totalStudyTime / 60) * 10) / 10;
  const averageSessionTime = studyLogs.length > 0 ? Math.round(totalStudyTime / studyLogs.length) : 0;
  const completionRate = flashcards.length > 0 ? Math.round(((flashcards.length - dueCards.length) / flashcards.length) * 100) : 100;

  return (
    <div className="max-w-7xl mx-auto px-6 space-y-8">
      {/* Welcome Section */}
      <div className="text-center mb-8">
        <h2 className="text-4xl font-black bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent mb-4">
          Welcome back! 🚀
        </h2>
        <p className="text-white/80 text-lg">
          Ready to crush your learning goals today?
        </p>
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
        <div className="group bg-gradient-to-br from-purple-500/20 to-indigo-600/20 backdrop-blur-xl rounded-2xl border-purple-500/30 p-6 hover:shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 transform hover:-translate-y-2 hover:scale-105 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/5 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-xl shadow-lg group-hover:animate-bounce">
                <Brain className="text-white" size={24} />
              </div>
              <div className="text-right">
                <p className="text-3xl font-black text-white">{flashcards.length}</p>
                <p className="text-sm text-purple-200 font-medium">Total Cards</p>
              </div>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Flashcards</h3>
            <p className="text-purple-200 mb-4 text-sm">
              {dueCards.length > 0 ? `🔥 ${dueCards.length} cards due for review` : '✨ All caught up!'}
            </p>
            <div className="w-full bg-white/10 rounded-full h-2 mb-4">
              <div 
                className="bg-gradient-to-r from-purple-500 to-indigo-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${completionRate}%` }}
              ></div>
            </div>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onTabChange('flashcards');
              }}
              className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 text-white py-3 rounded-xl hover:from-purple-600 hover:to-indigo-700 transition-all duration-300 font-bold shadow-lg hover:shadow-purple-500/50 transform hover:scale-105 flex items-center justify-center space-x-2"
              style={{ touchAction: 'manipulation' }}
            >
              <Zap size={16} />
              <span>Study Now</span>
            </button>
          </div>
        </div>

        {/* Study Sessions Card */}
        <div className="group bg-gradient-to-br from-purple-500/20 to-indigo-600/20 backdrop-blur-xl rounded-2xl border-purple-500/30 p-6 hover:shadow-2xl hover:shadow-green-500/25 transition-all duration-300 transform hover:-translate-y-2 hover:scale-105 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-green-500/5 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-green-400 to-teal-500 rounded-xl shadow-lg group-hover:animate-spin">
                <Clock className="text-white" size={24} />
              </div>
              <div className="text-right">
                <p className="text-3xl font-black text-white">{studyLogs.length}</p>
                <p className="text-sm text-green-200 font-medium">Sessions</p>
              </div>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Study Sessions</h3>
            <p className="text-green-200 mb-4 text-sm">
              {studyLogs.length > 0 ? `⏱️ ${averageSessionTime} min avg session` : '🌟 Start your first session'}
            </p>
            <div className="flex items-center space-x-2 mb-4">
              <TrendingUp className="text-green-400" size={16} />
              <span className="text-green-200 text-sm font-medium">{totalStudyHours}h total study time</span>
            </div>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onTabChange('pomodoro');
              }}
              className="w-full bg-gradient-to-r from-green-500 to-teal-600 text-white py-3 rounded-xl hover:from-green-600 hover:to-teal-700 transition-all duration-300 font-bold shadow-lg hover:shadow-green-500/50 transform hover:scale-105 flex items-center justify-center space-x-2"
              style={{ touchAction: 'manipulation' }}
            >
              <Clock size={16} />
              <span>Start Timer</span>
            </button>
          </div>
        </div>

        {/* Analytics Card */}
        <div className="group bg-gradient-to-br from-purple-500/20 to-indigo-600/20 backdrop-blur-xl rounded-2xl border-purple-500/30 p-6 hover:shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:-translate-y-2 hover:scale-105 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/5 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-xl shadow-lg group-hover:animate-pulse">
                <BarChart3 className="text-white" size={24} />
              </div>
              <div className="text-right">
                <p className="text-3xl font-black text-white">{totalStudyHours}</p>
                <p className="text-sm text-blue-200 font-medium">Hours</p>
              </div>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Analytics</h3>
            <p className="text-blue-200 mb-4 text-sm">
              {studyLogs.length > 0 ? '📈 Track your progress' : '📊 No data yet'}
            </p>
            <div className="flex items-center space-x-2 mb-4">
              <Star className="text-blue-400" size={16} />
              <span className="text-blue-200 text-sm font-medium">Detailed insights available</span>
            </div>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onTabChange('analytics');
              }}
              className="w-full bg-gradient-to-r from-blue-500 to-cyan-600 text-white py-3 rounded-xl hover:from-blue-600 hover:to-cyan-700 transition-all duration-300 font-bold shadow-lg hover:shadow-blue-500/50 transform hover:scale-105 flex items-center justify-center space-x-2"
              style={{ touchAction: 'manipulation' }}
            >
              <BarChart3 size={16} />
              <span>View Analytics</span>
            </button>
          </div>
        </div>

        {/* Advanced Study Card */}
        <div className="group bg-gradient-to-br from-purple-500/20 to-indigo-600/20 backdrop-blur-xl rounded-2xl border-purple-500/30 p-6 hover:shadow-2xl hover:shadow-indigo-500/25 transition-all duration-300 transform hover:-translate-y-2 hover:scale-105 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-500/5 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-xl shadow-lg group-hover:animate-bounce">
                <Target className="text-white" size={24} />
              </div>
              <div className="text-right">
                <p className="text-3xl font-black text-white">4</p>
                <p className="text-sm text-indigo-200 font-medium">Modes</p>
              </div>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Advanced Study</h3>
            <p className="text-indigo-200 mb-4 text-sm">
              Active recall, cloze deletion, concept explanation & more
            </p>
            <div className="flex items-center space-x-2 mb-4">
              <Trophy className="text-indigo-400" size={16} />
              <span className="text-indigo-200 text-sm font-medium">Pro learning techniques</span>
            </div>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onTabChange('study');
              }}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 rounded-xl hover:from-indigo-600 hover:to-purple-700 transition-all duration-300 font-bold shadow-lg hover:shadow-indigo-500/50 transform hover:scale-105 flex items-center justify-center space-x-2"
              style={{ touchAction: 'manipulation' }}
            >
              <Target size={16} />
              <span>Start Learning</span>
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
              className="bg-gradient-to-r from-purple-500/20 to-indigo-600/20 border border-purple-500/30 p-4 rounded-xl hover:from-purple-500/30 hover:to-indigo-600/30 transition-all duration-300 group"
              style={{ touchAction: 'manipulation' }}
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-500/20 rounded-lg group-hover:bg-purple-500/30 transition-colors">
                  <Brain size={20} className="text-purple-400" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-white">Add Card</div>
                  <div className="text-xs text-purple-200">Create new flashcard</div>
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
                onTabChange('study');
              }}
              className="bg-gradient-to-r from-indigo-500/20 to-purple-600/20 border border-indigo-500/30 p-4 rounded-xl hover:from-indigo-500/30 hover:to-purple-600/30 transition-all duration-300 group"
              style={{ touchAction: 'manipulation' }}
            >
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-indigo-500/20 rounded-lg group-hover:bg-indigo-500/30 transition-colors">
                  <Target size={20} className="text-indigo-400" />
                </div>
                <div className="text-left">
                  <div className="font-bold text-white">Study Mode</div>
                  <div className="text-xs text-indigo-200">Advanced techniques</div>
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
