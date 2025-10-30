import React, { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar
} from 'recharts';
import { format, subDays, startOfDay, endOfDay, isWithinInterval } from 'date-fns';
import {
  TrendingUp,
  Clock,
  Brain,
  Target,
  Calendar,
  Award,
  Zap,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  BookOpen,
  Timer,
  Star
} from 'lucide-react';

const AdvancedAnalytics = ({ studyLogs, flashcards }) => {
  const [timeRange, setTimeRange] = useState('7d');
  const [activeChart, setActiveChart] = useState('overview');

  // Color schemes for charts
  const colors = {
    primary: '#6366f1',
    secondary: '#8b5cf6',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    info: '#06b6d4'
  };

  const chartColors = [colors.primary, colors.secondary, colors.success, colors.warning, colors.danger, colors.info];

  // Calculate analytics data
  const analytics = useMemo(() => {
    const now = new Date();
    const daysBack = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90;
    const startDate = subDays(now, daysBack);

    // Filter data by time range
    const filteredLogs = studyLogs.filter(log => {
      const logDate = new Date(log.createdAt || log.date);
      return isWithinInterval(logDate, { start: startDate, end: now });
    });

    // Daily study time
    const dailyData = [];
    for (let i = daysBack - 1; i >= 0; i--) {
      const date = subDays(now, i);
      const dayStart = startOfDay(date);
      const dayEnd = endOfDay(date);
      
      const dayLogs = filteredLogs.filter(log => {
        const logDate = new Date(log.createdAt || log.date);
        return isWithinInterval(logDate, { start: dayStart, end: dayEnd });
      });

      const totalTime = dayLogs.reduce((sum, log) => sum + (log.duration || 0), 0);
      const sessionCount = dayLogs.length;

      dailyData.push({
        date: format(date, 'MMM dd'),
        fullDate: date,
        studyTime: totalTime,
        sessions: sessionCount,
        avgSessionLength: sessionCount > 0 ? Math.round(totalTime / sessionCount) : 0
      });
    }

    // Subject performance
    const subjectStats = {};
    filteredLogs.forEach(log => {
      if (!subjectStats[log.subject]) {
        subjectStats[log.subject] = {
          name: log.subject,
          totalTime: 0,
          sessions: 0,
          cards: 0
        };
      }
      subjectStats[log.subject].totalTime += log.duration || 0;
      subjectStats[log.subject].sessions += 1;
    });

    // Add flashcard data to subjects
    flashcards.forEach(card => {
      if (!subjectStats[card.subject]) {
        subjectStats[card.subject] = {
          name: card.subject,
          totalTime: 0,
          sessions: 0,
          cards: 0
        };
      }
      subjectStats[card.subject].cards += 1;
    });

    const subjectData = Object.values(subjectStats).map((subject, index) => ({
      ...subject,
      avgTimePerSession: subject.sessions > 0 ? Math.round(subject.totalTime / subject.sessions) : 0,
      color: chartColors[index % chartColors.length]
    }));

    // Study streak calculation
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;
    let lastStudyDate = null;

    const sortedLogs = [...studyLogs].sort((a, b) => 
      new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date)
    );

    const studyDates = [...new Set(sortedLogs.map(log => 
      format(new Date(log.createdAt || log.date), 'yyyy-MM-dd')
    ))].sort();

    for (let i = 0; i < studyDates.length; i++) {
      const currentDate = new Date(studyDates[i]);
      
      if (lastStudyDate) {
        const daysDiff = Math.floor((currentDate - lastStudyDate) / (1000 * 60 * 60 * 24));
        if (daysDiff === 1) {
          tempStreak++;
        } else {
          longestStreak = Math.max(longestStreak, tempStreak);
          tempStreak = 1;
        }
      } else {
        tempStreak = 1;
      }
      
      lastStudyDate = currentDate;
    }
    longestStreak = Math.max(longestStreak, tempStreak);

    // Current streak (from today backwards)
    const today = format(new Date(), 'yyyy-MM-dd');
    if (studyDates.includes(today)) {
      currentStreak = 1;
      for (let i = 1; i < studyDates.length; i++) {
        const prevDate = format(subDays(new Date(), i), 'yyyy-MM-dd');
        if (studyDates.includes(prevDate)) {
          currentStreak++;
        } else {
          break;
        }
      }
    }

    // Performance metrics
    const totalStudyTime = filteredLogs.reduce((sum, log) => sum + (log.duration || 0), 0);
    const totalSessions = filteredLogs.length;
    const avgSessionLength = totalSessions > 0 ? Math.round(totalStudyTime / totalSessions) : 0;
    const totalCards = flashcards.length;
    const reviewedCards = flashcards.filter(card => card.reviewCount > 0).length;
    const masteryRate = totalCards > 0 ? Math.round((reviewedCards / totalCards) * 100) : 0;

    // Hourly distribution
    const hourlyData = Array.from({ length: 24 }, (_, hour) => ({
      hour: `${hour}:00`,
      sessions: 0,
      totalTime: 0
    }));

    filteredLogs.forEach(log => {
      const hour = new Date(log.createdAt || Date.now()).getHours();
      hourlyData[hour].sessions += 1;
      hourlyData[hour].totalTime += log.duration || 0;
    });

    // Difficulty distribution
    const difficultyData = [
      { name: 'Easy', value: flashcards.filter(c => c.difficulty === 'easy').length, color: colors.success },
      { name: 'Medium', value: flashcards.filter(c => c.difficulty === 'medium').length, color: colors.warning },
      { name: 'Hard', value: flashcards.filter(c => c.difficulty === 'hard').length, color: colors.danger }
    ].filter(d => d.value > 0);

    return {
      dailyData,
      subjectData,
      hourlyData,
      difficultyData,
      metrics: {
        totalStudyTime,
        totalSessions,
        avgSessionLength,
        totalCards,
        reviewedCards,
        masteryRate,
        currentStreak,
        longestStreak
      }
    };
  }, [studyLogs, flashcards, timeRange]);

  const MetricCard = ({ icon: Icon, title, value, subtitle, color = colors.primary, trend }) => (
    <div className="bg-gradient-to-br from-amber-900/20 to-black/50 backdrop-blur-xl rounded-lg border-2 border-amber-400/50 p-6 shadow-2xl hover:shadow-amber-500/25 transition-all duration-300 transform hover:-translate-y-1 hover:scale-105 group animate-bounce-in relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/5 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="p-4 rounded-lg bg-gradient-to-br from-amber-600/20 to-orange-700/20 backdrop-blur-sm border-2 border-amber-400/50">
          <Icon size={28} className="text-amber-400" />
        </div>
        {trend && (
          <div className={`flex items-center text-sm font-mono font-bold px-3 py-1 rounded border backdrop-blur-sm ${trend > 0 ? 'text-green-300 bg-green-500/20 border-green-400/50' : 'text-red-300 bg-red-500/20 border-red-400/50'}`}>
            <TrendingUp size={16} className={trend < 0 ? 'transform rotate-180' : ''} />
            <span className="ml-1">{Math.abs(trend)}%</span>
          </div>
        )}
      </div>
      <div className="relative z-10">
        <h3 className="text-3xl font-black text-amber-400 mb-2 font-mono">{value}</h3>
        <p className="text-amber-300 font-bold mb-1 font-mono">{title}</p>
        {subtitle && <p className="text-amber-400/70 text-sm font-mono">{subtitle}</p>}
      </div>
    </div>
  );

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-800">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.name}: {entry.value}
              {entry.name.includes('Time') ? ' min' : entry.name.includes('sessions') ? ' sessions' : ''}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Dungeon Header */}
      <div className="bg-gradient-to-br from-amber-900/20 to-black/50 backdrop-blur-xl rounded-lg border-2 border-amber-400/50 p-8 shadow-2xl animate-slide-up">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="text-center md:text-left">
            <h2 className="text-4xl font-black text-white mb-4 flex items-center justify-center md:justify-start">
              Advanced Analytics
            </h2>
            <p className="text-white/80 text-xl font-medium max-w-2xl">
              Deep insights into your learning patterns and progress
            </p>
          </div>
          
          <div className="flex items-center justify-center mt-6 md:mt-0">
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-6 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl text-white font-bold focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent"
            >
              <option value="7d" className="bg-gray-800 text-white">Last 7 days</option>
              <option value="30d" className="bg-gray-800 text-white">Last 30 days</option>
              <option value="90d" className="bg-gray-800 text-white">Last 90 days</option>
            </select>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          icon={Clock}
          title="Total Study Time"
          value={`${analytics.metrics.totalStudyTime} min`}
          subtitle={`${Math.round(analytics.metrics.totalStudyTime / 60)} hours`}
          color={colors.primary}
        />
        <MetricCard
          icon={Activity}
          title="Study Sessions"
          value={analytics.metrics.totalSessions}
          subtitle={`Avg: ${analytics.metrics.avgSessionLength} min/session`}
          color={colors.secondary}
        />
        <MetricCard
          icon={Brain}
          title="Flashcard Mastery"
          value={`${analytics.metrics.masteryRate}%`}
          subtitle={`${analytics.metrics.reviewedCards}/${analytics.metrics.totalCards} cards reviewed`}
          color={colors.success}
        />
        <MetricCard
          icon={Award}
          title="Study Streak"
          value={`${analytics.metrics.currentStreak} days`}
          subtitle={`Longest: ${analytics.metrics.longestStreak} days`}
          color={colors.warning}
        />
      </div>

      {/* Dungeon Chart Navigation */}
      <div className="bg-gradient-to-br from-amber-900/20 to-black/50 backdrop-blur-xl rounded-lg border-2 border-amber-400/50 p-6 shadow-2xl animate-slide-up" style={{animationDelay: '0.2s'}}>
        <div className="flex flex-wrap gap-4 justify-center">
          {[
            { id: 'overview', label: 'QUEST PROGRESS', icon: TrendingUp },
            { id: 'subjects', label: 'SUBJECT ANALYSIS', icon: BookOpen },
            { id: 'timing', label: 'QUEST TIMING', icon: Timer },
            { id: 'difficulty', label: 'SCROLL DIFFICULTY', icon: Target }
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveChart(id)}
              className={`flex items-center space-x-3 px-6 py-4 rounded border-2 font-mono font-bold transition-all duration-300 transform hover:scale-105 ${
                activeChart === id
                  ? 'bg-gradient-to-r from-amber-600 to-orange-700 text-white border-amber-400/50 shadow-lg shadow-amber-500/50'
                  : 'bg-amber-900/20 backdrop-blur-sm text-amber-300/80 hover:bg-amber-500/20 border-amber-400/30'
              }`}
            >
              <Icon size={20} />
              <span>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Charts */}
      <div className="bg-gradient-to-br from-gray-500/10 to-gray-600/10 backdrop-blur-xl rounded-3xl border border-white/20 p-8 shadow-2xl animate-slide-up" style={{animationDelay: '0.3s'}}>
        {activeChart === 'overview' && (
          <div>
            <h3 className="text-3xl font-bold text-white mb-8 text-center">Daily Study Progress</h3>
            <ResponsiveContainer width="100%" height={400}>
              <AreaChart data={analytics.dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="studyTime"
                  stackId="1"
                  stroke={colors.primary}
                  fill={colors.primary}
                  fillOpacity={0.6}
                  name="Study Time (min)"
                />
                <Area
                  type="monotone"
                  dataKey="sessions"
                  stackId="2"
                  stroke={colors.secondary}
                  fill={colors.secondary}
                  fillOpacity={0.6}
                  name="Sessions"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {activeChart === 'subjects' && (
          <div>
            <h3 className="text-3xl font-bold text-white mb-8 text-center">Subject Performance</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <h4 className="text-2xl font-bold text-white mb-6 text-center">Study Time by Subject</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analytics.subjectData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="totalTime"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {analytics.subjectData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <h4 className="text-2xl font-bold text-white mb-6 text-center">Cards per Subject</h4>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.subjectData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="cards" fill={colors.success} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeChart === 'timing' && (
          <div>
            <h3 className="text-3xl font-bold text-white mb-8 text-center">Study Timing Patterns</h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={analytics.hourlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="sessions"
                  stroke={colors.primary}
                  strokeWidth={2}
                  name="Sessions"
                />
                <Line
                  type="monotone"
                  dataKey="totalTime"
                  stroke={colors.secondary}
                  strokeWidth={2}
                  name="Total Time (min)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {activeChart === 'difficulty' && (
          <div>
            <h3 className="text-3xl font-bold text-white mb-8 text-center">Flashcard Difficulty Distribution</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analytics.difficultyData}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {analytics.difficultyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 flex flex-col justify-center space-y-4">
                {analytics.difficultyData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-white/10 backdrop-blur-sm rounded-xl border border-white/10">
                    <div className="flex items-center space-x-3">
                      <div
                        className="w-5 h-5 rounded-full shadow-lg"
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className="font-bold text-white">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-black text-white">{item.value}</div>
                      <div className="text-sm text-white/70 font-medium">cards</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Insights Panel */}
      <div className="bg-gradient-to-br from-yellow-500/20 to-orange-600/20 backdrop-blur-xl rounded-3xl border border-white/20 p-8 shadow-2xl animate-slide-up" style={{animationDelay: '0.4s'}}>
        <h3 className="text-3xl font-bold text-white mb-8 flex items-center justify-center">
          <Star className="mr-3 text-yellow-400" size={32} />
          Key Insights
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <h4 className="font-bold text-white mb-3 text-xl">Most Productive Time</h4>
            <p className="text-white/90 font-medium">
              {(() => {
                const maxHour = analytics.hourlyData.reduce((max, hour) => 
                  hour.totalTime > max.totalTime ? hour : max
                );
                return `You study most effectively at ${maxHour.hour} with ${maxHour.totalTime} minutes total.`;
              })()}
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <h4 className="font-bold text-white mb-3 text-xl">Study Consistency</h4>
            <p className="text-white/90 font-medium">
              {analytics.metrics.currentStreak > 0 
                ? `Great job! You're on a ${analytics.metrics.currentStreak}-day streak.`
                : "Start a new study streak today!"
              }
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <h4 className="font-bold text-white mb-3 text-xl">Focus Area</h4>
            <p className="text-white/90 font-medium">
              {(() => {
                const topSubject = analytics.subjectData.reduce((max, subject) => 
                  subject.totalTime > max.totalTime ? subject : max, { totalTime: 0, name: 'None' }
                );
                return `${topSubject.name} is your most studied subject with ${topSubject.totalTime} minutes.`;
              })()}
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <h4 className="font-bold text-white mb-3 text-xl">Learning Progress</h4>
            <p className="text-white/90 font-medium">
              {analytics.metrics.masteryRate >= 80 
                ? "Excellent mastery rate! You're doing great."
                : analytics.metrics.masteryRate >= 60
                ? "Good progress! Keep reviewing your cards."
                : "Focus on reviewing more cards to improve mastery."
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedAnalytics;