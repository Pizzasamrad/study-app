import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { 
  TrendingUp, Calendar, Clock, Target, Award, Flame, 
  Brain, BookOpen, Zap, Star, Trophy, Lightbulb,
  BarChart3, PieChart as PieChartIcon, Activity, Target as TargetIcon
} from 'lucide-react';

const SmartAnalytics = ({ studyLogs, flashcards, blurts }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [timeRange, setTimeRange] = useState('week');

  // Calculate comprehensive analytics
  const analytics = useMemo(() => {
    const now = new Date();
    const totalStudyTime = studyLogs.reduce((sum, log) => sum + log.duration, 0);
    const totalCards = flashcards.length;
    const reviewedCards = flashcards.filter(card => card.reviewCount > 0).length;
    const dueCards = flashcards.filter(card => 
      card.nextReviewDate && card.nextReviewDate <= now.toISOString()
    ).length;

    // Calculate study streak
    const sortedLogs = studyLogs.sort((a, b) => new Date(b.createdAt || Date.now()) - new Date(a.createdAt || Date.now()));
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

    // Subject analysis
    const subjectStats = studyLogs.reduce((acc, log) => {
      acc[log.subject] = (acc[log.subject] || 0) + log.duration;
      return acc;
    }, {});

    // Weekly progress data
    const weeklyData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayLogs = studyLogs.filter(log => {
        const logDate = new Date(log.createdAt || Date.now()).toDateString();
        return logDate === date.toDateString();
      });
      const dayTotal = dayLogs.reduce((sum, log) => sum + log.duration, 0);
      weeklyData.push({
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        minutes: dayTotal,
        sessions: dayLogs.length,
        date: date.toDateString()
      });
    }

    // Subject distribution for pie chart
    const subjectData = Object.entries(subjectStats).map(([subject, minutes]) => ({
      name: subject,
      value: minutes,
      percentage: Math.round((minutes / totalStudyTime) * 100)
    }));

    // Study efficiency metrics
    const averageSessionLength = studyLogs.length > 0 ? Math.round(totalStudyTime / studyLogs.length) : 0;
    const studyEfficiency = Math.round((reviewedCards / totalCards) * 100) || 0;
    const consistencyScore = Math.min(currentStreak * 10, 100);

    // Performance radar chart data
    const performanceData = [
      { subject: 'Consistency', value: consistencyScore },
      { subject: 'Efficiency', value: studyEfficiency },
      { subject: 'Engagement', value: Math.min(blurts.length * 5, 100) },
      { subject: 'Retention', value: Math.min(reviewedCards * 2, 100) },
      { subject: 'Time Management', value: Math.min(averageSessionLength * 2, 100) }
    ];

    // Predictive insights
    const insights = [];
    if (currentStreak > 7) insights.push({ type: 'success', message: '🔥 Amazing consistency! You\'re building excellent study habits.' });
    if (dueCards > 5) insights.push({ type: 'warning', message: '⚠️ You have several cards due for review. Consider a review session.' });
    if (averageSessionLength < 15) insights.push({ type: 'info', message: '💡 Try longer study sessions (25+ minutes) for better focus.' });
    if (studyEfficiency < 50) insights.push({ type: 'warning', message: '📚 Focus on reviewing existing cards to improve retention.' });
    if (totalStudyTime > 10) insights.push({ type: 'success', message: '🎯 Great progress! You\'ve put in significant study time.' });

    return {
      totalStudyTime,
      totalCards,
      reviewedCards,
      dueCards,
      currentStreak,
      averageSessionLength,
      studyEfficiency,
      consistencyScore,
      weeklyData,
      subjectData,
      performanceData,
      insights,
      subjectStats
    };
  }, [studyLogs, flashcards, blurts]);

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1', '#d084d0'];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-br from-purple-500/20 to-indigo-600/20 backdrop-blur-xl rounded-3xl border border-white/20 p-8 shadow-2xl">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center space-y-6 lg:space-y-0">
          <div>
            <h2 className="text-4xl font-black text-white mb-2 flex items-center">
              📊 Smart Analytics Dashboard
            </h2>
            <p className="text-white/80 text-lg">Advanced insights and predictive analytics for your study journey</p>
          </div>
          
          <div className="flex flex-wrap gap-4">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white font-medium focus:outline-none focus:ring-2 focus:ring-purple-400"
            >
              <option value="week">📅 This Week</option>
              <option value="month">📅 This Month</option>
              <option value="all">📅 All Time</option>
            </select>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex justify-center">
        <div className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 p-2 flex space-x-2 shadow-2xl">
          {[
            { id: 'overview', label: 'Overview', icon: BarChart3, color: 'from-blue-400 to-cyan-500' },
            { id: 'performance', label: 'Performance', icon: Target, color: 'from-green-400 to-emerald-500' },
            { id: 'insights', label: 'Insights', icon: Lightbulb, color: 'from-yellow-400 to-orange-500' },
            { id: 'predictions', label: 'Predictions', icon: TrendingUp, color: 'from-purple-400 to-pink-500' }
          ].map(({ id, label, icon: Icon, color }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center space-x-2 px-6 py-3 rounded-2xl transition-all duration-300 font-bold ${
                activeTab === id 
                  ? `bg-gradient-to-r ${color} text-white shadow-lg` 
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              <Icon size={20} />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-blue-500/20 to-cyan-600/20 backdrop-blur-xl rounded-3xl border border-white/20 p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-blue-400 to-cyan-500 rounded-2xl">
                  <Clock className="text-white" size={24} />
                </div>
                <div className="text-right">
                  <p className="text-3xl font-black text-white">{Math.round(analytics.totalStudyTime / 60 * 10) / 10}</p>
                  <p className="text-sm text-blue-200">⏰ Total Hours</p>
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Study Time</h3>
              <p className="text-blue-200">Your total learning investment</p>
            </div>

            <div className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 backdrop-blur-xl rounded-3xl border border-white/20 p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl">
                  <Flame className="text-white" size={24} />
                </div>
                <div className="text-right">
                  <p className="text-3xl font-black text-white">{analytics.currentStreak}</p>
                  <p className="text-sm text-green-200">🔥 Day Streak</p>
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Consistency</h3>
              <p className="text-green-200">Keep the momentum going!</p>
            </div>

            <div className="bg-gradient-to-br from-purple-500/20 to-pink-600/20 backdrop-blur-xl rounded-3xl border border-white/20 p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl">
                  <Brain className="text-white" size={24} />
                </div>
                <div className="text-right">
                  <p className="text-3xl font-black text-white">{analytics.totalCards}</p>
                  <p className="text-sm text-purple-200">🧠 Flashcards</p>
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Knowledge Base</h3>
              <p className="text-purple-200">Your learning foundation</p>
            </div>

            <div className="bg-gradient-to-br from-yellow-500/20 to-orange-600/20 backdrop-blur-xl rounded-3xl border border-white/20 p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl">
                  <Target className="text-white" size={24} />
                </div>
                <div className="text-right">
                  <p className="text-3xl font-black text-white">{analytics.studyEfficiency}%</p>
                  <p className="text-sm text-yellow-200">🎯 Efficiency</p>
                </div>
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Study Efficiency</h3>
              <p className="text-yellow-200">How well you're retaining</p>
            </div>
          </div>

          {/* Weekly Progress Chart */}
          <div className="bg-gradient-to-br from-indigo-500/20 to-purple-600/20 backdrop-blur-xl rounded-3xl border border-white/20 p-8 shadow-2xl">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
              <TrendingUp className="mr-3" size={24} />
              Weekly Study Progress
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="day" stroke="rgba(255,255,255,0.7)" />
                  <YAxis stroke="rgba(255,255,255,0.7)" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(0,0,0,0.8)', 
                      border: 'none', 
                      borderRadius: '12px',
                      color: 'white'
                    }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="minutes" 
                    stroke="#8884d8" 
                    fill="url(#colorGradient)"
                    strokeWidth={3}
                  />
                  <defs>
                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Subject Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 backdrop-blur-xl rounded-3xl border border-white/20 p-8 shadow-2xl">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                <PieChartIcon className="mr-3" size={24} />
                Subject Distribution
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.subjectData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percentage }) => `${name}: ${percentage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {analytics.subjectData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(0,0,0,0.8)', 
                        border: 'none', 
                        borderRadius: '12px',
                        color: 'white'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-500/20 to-cyan-600/20 backdrop-blur-xl rounded-3xl border border-white/20 p-8 shadow-2xl">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                <BarChart3 className="mr-3" size={24} />
                Study Sessions
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis dataKey="day" stroke="rgba(255,255,255,0.7)" />
                    <YAxis stroke="rgba(255,255,255,0.7)" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(0,0,0,0.8)', 
                        border: 'none', 
                        borderRadius: '12px',
                        color: 'white'
                      }}
                    />
                    <Bar dataKey="sessions" fill="#82ca9d" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Performance Tab */}
      {activeTab === 'performance' && (
        <div className="space-y-8">
          {/* Performance Radar Chart */}
          <div className="bg-gradient-to-br from-purple-500/20 to-pink-600/20 backdrop-blur-xl rounded-3xl border border-white/20 p-8 shadow-2xl">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
              <TargetIcon className="mr-3" size={24} />
              Performance Analysis
            </h3>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={analytics.performanceData}>
                  <PolarGrid stroke="rgba(255,255,255,0.2)" />
                  <PolarAngleAxis dataKey="subject" stroke="rgba(255,255,255,0.7)" />
                  <PolarRadiusAxis stroke="rgba(255,255,255,0.2)" />
                  <Radar
                    name="Performance"
                    dataKey="value"
                    stroke="#8884d8"
                    fill="#8884d8"
                    fillOpacity={0.3}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(0,0,0,0.8)', 
                      border: 'none', 
                      borderRadius: '12px',
                      color: 'white'
                    }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 backdrop-blur-xl rounded-3xl border border-white/20 p-6 shadow-2xl text-center">
              <div className="text-4xl font-black text-white mb-2">{analytics.consistencyScore}%</div>
              <div className="text-green-200 font-bold">Consistency Score</div>
              <div className="text-green-200/70 text-sm mt-2">Based on your study streak</div>
            </div>
            
            <div className="bg-gradient-to-br from-blue-500/20 to-cyan-600/20 backdrop-blur-xl rounded-3xl border border-white/20 p-6 shadow-2xl text-center">
              <div className="text-4xl font-black text-white mb-2">{analytics.averageSessionLength}m</div>
              <div className="text-blue-200 font-bold">Avg Session Length</div>
              <div className="text-blue-200/70 text-sm mt-2">Optimal: 25-45 minutes</div>
            </div>
            
            <div className="bg-gradient-to-br from-purple-500/20 to-pink-600/20 backdrop-blur-xl rounded-3xl border border-white/20 p-6 shadow-2xl text-center">
              <div className="text-4xl font-black text-white mb-2">{analytics.reviewedCards}</div>
              <div className="text-purple-200 font-bold">Cards Reviewed</div>
              <div className="text-purple-200/70 text-sm mt-2">Active learning progress</div>
            </div>
          </div>
        </div>
      )}

      {/* Insights Tab */}
      {activeTab === 'insights' && (
        <div className="space-y-8">
          {/* Smart Insights */}
          <div className="bg-gradient-to-br from-yellow-500/20 to-orange-600/20 backdrop-blur-xl rounded-3xl border border-white/20 p-8 shadow-2xl">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
              <Lightbulb className="mr-3" size={24} />
              Smart Insights & Recommendations
            </h3>
            <div className="space-y-4">
              {analytics.insights.map((insight, index) => (
                <div key={index} className={`p-4 rounded-2xl backdrop-blur-sm border border-white/20 ${
                  insight.type === 'success' ? 'bg-green-500/20' :
                  insight.type === 'warning' ? 'bg-yellow-500/20' :
                  'bg-blue-500/20'
                }`}>
                  <p className="text-white font-medium">{insight.message}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Study Recommendations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 backdrop-blur-xl rounded-3xl border border-white/20 p-8 shadow-2xl">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                <Target className="mr-3" size={24} />
                Recommended Actions
              </h3>
              <div className="space-y-4">
                {analytics.dueCards > 0 && (
                  <div className="p-4 bg-white/10 rounded-2xl">
                    <div className="font-bold text-white mb-2">📚 Review Due Cards</div>
                    <div className="text-green-200">You have {analytics.dueCards} cards waiting for review</div>
                  </div>
                )}
                {analytics.currentStreak < 3 && (
                  <div className="p-4 bg-white/10 rounded-2xl">
                    <div className="font-bold text-white mb-2">🔥 Build Your Streak</div>
                    <div className="text-green-200">Study for at least 5 minutes today to maintain momentum</div>
                  </div>
                )}
                {analytics.averageSessionLength < 20 && (
                  <div className="p-4 bg-white/10 rounded-2xl">
                    <div className="font-bold text-white mb-2">⏰ Extend Study Sessions</div>
                    <div className="text-green-200">Try 25-minute focused sessions for better retention</div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-500/20 to-cyan-600/20 backdrop-blur-xl rounded-3xl border border-white/20 p-8 shadow-2xl">
              <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
                <Trophy className="mr-3" size={24} />
                Achievements
              </h3>
              <div className="space-y-4">
                {analytics.currentStreak >= 7 && (
                  <div className="p-4 bg-yellow-500/20 rounded-2xl border border-yellow-400/30">
                    <div className="font-bold text-yellow-200 mb-2">🏆 Week Warrior</div>
                    <div className="text-yellow-200/80">7+ day study streak achieved!</div>
                  </div>
                )}
                {analytics.totalStudyTime > 10 && (
                  <div className="p-4 bg-blue-500/20 rounded-2xl border border-blue-400/30">
                    <div className="font-bold text-blue-200 mb-2">📚 Knowledge Seeker</div>
                    <div className="text-blue-200/80">10+ hours of study time logged!</div>
                  </div>
                )}
                {analytics.totalCards >= 50 && (
                  <div className="p-4 bg-purple-500/20 rounded-2xl border border-purple-400/30">
                    <div className="font-bold text-purple-200 mb-2">🧠 Memory Master</div>
                    <div className="text-purple-200/80">50+ flashcards created!</div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Predictions Tab */}
      {activeTab === 'predictions' && (
        <div className="space-y-8">
          {/* Predictive Analytics */}
          <div className="bg-gradient-to-br from-purple-500/20 to-pink-600/20 backdrop-blur-xl rounded-3xl border border-white/20 p-8 shadow-2xl">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
              <TrendingUp className="mr-3" size={24} />
              Predictive Analytics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="text-xl font-bold text-white mb-4">📈 Projected Progress</h4>
                <div className="space-y-4">
                  <div className="p-4 bg-white/10 rounded-2xl">
                    <div className="font-bold text-white">Next Week</div>
                    <div className="text-purple-200">Estimated {Math.round(analytics.totalStudyTime / 7)} hours of study time</div>
                  </div>
                  <div className="p-4 bg-white/10 rounded-2xl">
                    <div className="font-bold text-white">Retention Rate</div>
                    <div className="text-purple-200">Projected {Math.min(analytics.studyEfficiency + 5, 100)}% with current habits</div>
                  </div>
                  <div className="p-4 bg-white/10 rounded-2xl">
                    <div className="font-bold text-white">Streak Potential</div>
                    <div className="text-purple-200">Could reach {analytics.currentStreak + 7} days with consistency</div>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-xl font-bold text-white mb-4">🎯 Goal Tracking</h4>
                <div className="space-y-4">
                  <div className="p-4 bg-white/10 rounded-2xl">
                    <div className="font-bold text-white">Daily Study Goal</div>
                    <div className="text-purple-200">
                      {analytics.currentStreak > 0 ? '✅ On track!' : '🚀 Start your journey today!'}
                    </div>
                  </div>
                  <div className="p-4 bg-white/10 rounded-2xl">
                    <div className="font-bold text-white">Weekly Target</div>
                    <div className="text-purple-200">
                      {analytics.totalStudyTime > 5 ? '🎯 Exceeding expectations!' : '📊 Building momentum'}
                    </div>
                  </div>
                  <div className="p-4 bg-white/10 rounded-2xl">
                    <div className="font-bold text-white">Learning Velocity</div>
                    <div className="text-purple-200">
                      {analytics.totalCards > 20 ? '🚀 Accelerating!' : '📚 Steady progress'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartAnalytics;
