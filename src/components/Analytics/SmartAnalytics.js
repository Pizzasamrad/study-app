import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell
} from 'recharts';
import { 
  Clock, Calendar, BookOpen, TrendingUp, Flame, BarChart3
} from 'lucide-react';

const SmartAnalytics = ({ studyLogs, flashcards, blurts }) => {
  const [timeRange, setTimeRange] = useState('week');

  // Calculate simple study session analytics
  const analytics = useMemo(() => {
    const totalStudyTime = studyLogs.reduce((sum, log) => sum + (log.duration || 0), 0);
    const totalSessions = studyLogs.length;
    const averageSessionTime = totalSessions > 0 ? Math.round(totalStudyTime / totalSessions) : 0;
    
    // Calculate study streak
    const sortedLogs = studyLogs.sort((a, b) => new Date(b.timestamp || b.createdAt || Date.now()) - new Date(a.timestamp || a.createdAt || Date.now()));
    let currentStreak = 0;
    let lastDate = new Date().toDateString();
    
    for (const log of sortedLogs) {
      const logDate = new Date(log.timestamp || log.createdAt || Date.now()).toDateString();
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
      acc[log.subject] = (acc[log.subject] || 0) + (log.duration || 0);
      return acc;
    }, {});

    // Weekly progress data
    const weeklyData = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayLogs = studyLogs.filter(log => {
        const logDate = new Date(log.timestamp || log.createdAt || Date.now());
        return logDate.toDateString() === date.toDateString();
      });
      const dayTime = dayLogs.reduce((sum, log) => sum + (log.duration || 0), 0);
      weeklyData.push({
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        date: date.toLocaleDateString(),
        time: dayTime,
        sessions: dayLogs.length
      });
    }

    // Subject breakdown for pie chart
    const subjectData = Object.entries(subjectStats).map(([subject, time]) => ({
      subject,
      time,
      percentage: totalStudyTime > 0 ? Math.round((time / totalStudyTime) * 100) : 0
    }));

    return {
      totalStudyTime,
      totalSessions,
      averageSessionTime,
      currentStreak,
      weeklyData,
      subjectData,
      subjectStats
    };
  }, [studyLogs]);

  const formatTime = (minutes) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const COLORS = ['#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#EC4899'];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Dungeon Header */}
      <div className="bg-gradient-to-br from-amber-900/20 to-black/50 backdrop-blur-xl rounded-lg border-2 border-amber-400/50 p-8 shadow-2xl">
        <div className="text-center">
          <h2 className="text-4xl font-black text-amber-400 mb-4 flex items-center justify-center font-mono">
            <BarChart3 className="mr-3" size={32} />
            QUEST ANALYTICS
          </h2>
          <p className="text-amber-300 text-xl font-mono">
            TRACK YOUR QUEST SESSIONS AND TIME
          </p>
        </div>
      </div>

      {/* Time Range Selector */}
      <div className="bg-gradient-to-br from-amber-900/20 to-black/50 backdrop-blur-xl rounded-lg border-2 border-amber-400/50 p-6 shadow-2xl">
        <div className="flex justify-center space-x-4">
          {['week', 'month', 'all'].map(range => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-6 py-3 rounded border-2 font-mono font-bold transition-all duration-300 ${
                timeRange === range
                  ? 'bg-gradient-to-r from-amber-600 to-orange-700 text-white border-amber-400/50 shadow-lg shadow-amber-500/50'
                  : 'bg-amber-900/20 backdrop-blur-sm text-amber-300/80 hover:bg-amber-500/20 border-amber-400/30'
              }`}
            >
              {range === 'week' ? 'THIS WEEK' : range === 'month' ? 'THIS MONTH' : 'ALL TIME'}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Study Time */}
        <div className="bg-gradient-to-br from-amber-900/20 to-black/50 backdrop-blur-xl rounded-lg border-2 border-amber-400/50 p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-amber-600 to-orange-700 rounded-lg shadow-lg">
              <Clock className="text-white" size={24} />
            </div>
            <div className="text-right">
              <p className="text-3xl font-black text-amber-400 font-mono">{formatTime(analytics.totalStudyTime)}</p>
              <p className="text-sm text-amber-300 font-mono">TOTAL TIME</p>
            </div>
          </div>
          <h3 className="text-xl font-bold text-amber-400 mb-2 font-mono">QUEST TIME</h3>
          <p className="text-amber-300 text-sm font-mono">
            {analytics.totalStudyTime > 0 ? 'GREAT DEDICATION TO LEARNING!' : 'BEGIN YOUR FIRST QUEST'}
          </p>
        </div>

        {/* Total Sessions */}
        <div className="bg-gradient-to-br from-amber-900/20 to-black/50 backdrop-blur-xl rounded-lg border-2 border-amber-400/50 p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-amber-600 to-orange-700 rounded-lg shadow-lg">
              <BookOpen className="text-white" size={24} />
            </div>
            <div className="text-right">
              <p className="text-3xl font-black text-amber-400 font-mono">{analytics.totalSessions}</p>
              <p className="text-sm text-amber-300 font-mono">QUESTS</p>
            </div>
          </div>
          <h3 className="text-xl font-bold text-amber-400 mb-2 font-mono">QUEST SESSIONS</h3>
          <p className="text-blue-200 text-sm">
            {analytics.totalSessions > 0 ? 'Consistent study habits!' : 'Log your first session'}
          </p>
        </div>

        {/* Average Session */}
        <div className="bg-gradient-to-br from-amber-900/20 to-black/50 backdrop-blur-xl rounded-lg border-2 border-amber-400/50 p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-amber-600 to-orange-700 rounded-lg shadow-lg">
              <TrendingUp className="text-white" size={24} />
            </div>
            <div className="text-right">
              <p className="text-3xl font-black text-white">{formatTime(analytics.averageSessionTime)}</p>
              <p className="text-sm text-purple-200 font-medium">Average</p>
            </div>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Session Length</h3>
          <p className="text-purple-200 text-sm">
            {analytics.averageSessionTime > 0 ? 'Good focus duration!' : 'No sessions yet'}
          </p>
        </div>

        {/* Study Streak */}
        <div className="bg-gradient-to-br from-orange-500/20 to-red-600/20 backdrop-blur-xl rounded-3xl border border-white/20 p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl shadow-lg">
              <Flame className="text-white" size={24} />
            </div>
            <div className="text-right">
              <p className="text-3xl font-black text-white">{analytics.currentStreak}</p>
              <p className="text-sm text-orange-200 font-medium">Day Streak</p>
            </div>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Study Streak</h3>
          <p className="text-orange-200 text-sm">
            {analytics.currentStreak > 0 ? 'Keep the momentum going!' : 'Start your streak today'}
          </p>
        </div>
      </div>

      {/* Weekly Progress Chart */}
      <div className="bg-gradient-to-br from-amber-900/20 to-black/50 backdrop-blur-xl rounded-lg border-2 border-amber-400/50 p-8 shadow-2xl">
        <h3 className="text-3xl font-bold text-white mb-6 flex items-center">
          <Calendar className="mr-3" size={24} />
          Weekly Study Time
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={analytics.weeklyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="day" 
                stroke="rgba(255,255,255,0.8)"
                fontSize={12}
              />
              <YAxis 
                stroke="rgba(255,255,255,0.8)"
                fontSize={12}
                tickFormatter={(value) => `${value}m`}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'rgba(0,0,0,0.8)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '12px',
                  color: 'white'
                }}
                formatter={(value, name) => [`${value} minutes`, 'Study Time']}
              />
              <Bar 
                dataKey="time" 
                fill="url(#colorGradient)"
                radius={[4, 4, 0, 0]}
              />
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#8B5CF6" />
                  <stop offset="100%" stopColor="#06B6D4" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Subject Breakdown */}
      {analytics.subjectData.length > 0 && (
        <div className="bg-gradient-to-br from-teal-500/20 to-green-600/20 backdrop-blur-xl rounded-3xl border border-white/20 p-8 shadow-2xl">
          <h3 className="text-3xl font-bold text-white mb-6 flex items-center">
            <BookOpen className="mr-3" size={24} />
            Study Time by Subject
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.subjectData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ subject, percentage }) => `${subject}: ${percentage}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="time"
                  >
                    {analytics.subjectData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(0,0,0,0.8)',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '12px',
                      color: 'white'
                    }}
                    formatter={(value) => [`${formatTime(value)}`, 'Study Time']}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-4">
              {analytics.subjectData.map((subject, index) => (
                <div key={subject.subject} className="flex items-center justify-between p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                  <div className="flex items-center">
                    <div 
                      className="w-4 h-4 rounded-full mr-3"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    ></div>
                    <span className="text-white font-medium">{subject.subject}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-white font-bold">{formatTime(subject.time)}</div>
                    <div className="text-white/60 text-sm">{subject.percentage}%</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recent Study Sessions */}
      <div className="bg-gradient-to-br from-gray-500/20 to-gray-600/20 backdrop-blur-xl rounded-3xl border border-white/20 p-8 shadow-2xl">
        <h3 className="text-3xl font-bold text-white mb-6 flex items-center">
          <Clock className="mr-3" size={24} />
          Recent Study Sessions
        </h3>
        {studyLogs.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-6"></div>
            <p className="text-white/80 mb-4 text-xl font-medium">No study sessions logged yet</p>
            <p className="text-white/60">Start studying to see your progress here!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {studyLogs.slice(0, 10).map((log, index) => (
              <div key={log.id || index} className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 p-6 hover:bg-white/20 transition-all duration-200">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <h4 className="font-bold text-white text-lg mb-2 flex items-center">
                      <BookOpen className="mr-2 text-blue-400" size={18} />
                      {log.subject}
                    </h4>
                    <div className="flex items-center space-x-4 text-white/80 text-sm">
                      <span className="flex items-center">
                        <Clock className="mr-1" size={14} />
                        {log.duration} minutes
                      </span>
                      <span className="flex items-center">
                        <Calendar className="mr-1" size={14} />
                        {log.date} at {log.time}
                      </span>
                    </div>
                    {log.notes && (
                      <p className="text-white/70 mt-3 italic text-sm">{log.notes}</p>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-white/60">
                      {index === 0 ? 'Today' : index === 1 ? 'Yesterday' : `${index + 1} days ago`}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SmartAnalytics;