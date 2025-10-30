import React from 'react';
import { Trophy, Star, Target, Flame, Clock, Brain, Award, Zap } from 'lucide-react';
import { getLevelStats, getAchievements, getNextMilestone } from '../../services/levelService';

const LevelProgress = ({ studyLogs, flashcards, blurts, streakData }) => {
  const levelData = getLevelStats(studyLogs, flashcards, blurts, streakData);
  const achievements = getAchievements(levelData, levelData.stats);
  const nextMilestone = getNextMilestone(levelData, levelData.stats);

  return (
    <div className="space-y-6">
      {/* Dungeon Level Overview */}
      <div className="bg-gradient-to-br from-amber-900/20 to-black/50 backdrop-blur-xl rounded-lg border-2 border-amber-400/50 p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="p-4 bg-gradient-to-r from-amber-600 to-orange-700 rounded-lg">
              <Trophy className="text-white" size={32} />
            </div>
            <div>
              <h3 className="text-2xl font-black text-white">Level {levelData.level}</h3>
              <p className="text-purple-200 font-medium">{levelData.levelTitle.title}</p>
              <p className="text-purple-300 text-sm">{levelData.levelTitle.description}</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-black text-white">{levelData.totalXP}</div>
            <div className="text-purple-200 text-sm">Total XP</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-sm text-purple-200 mb-2">
            <span>Progress to Level {levelData.level + 1}</span>
            <span>{levelData.progress}%</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-3">
            <div 
              className="bg-gradient-to-r from-amber-600 to-orange-700 h-3 rounded-full transition-all duration-1000 ease-out"
              style={{ width: `${levelData.progress}%` }}
            ></div>
          </div>
          <div className="text-xs text-purple-300 mt-1">
            {levelData.xpToNextLevel > 0 ? `${levelData.xpToNextLevel} XP to next level` : 'Max level reached!'}
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-amber-900/20 to-black/50 backdrop-blur-xl rounded-lg border-2 border-amber-400/50 p-4 text-center">
          <Clock className="text-amber-400 mx-auto mb-2" size={24} />
          <div className="text-2xl font-black text-white">{Math.round(levelData.stats.totalStudyTime / 60)}</div>
          <div className="text-blue-200 text-sm">Hours Studied</div>
        </div>
        
        <div className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 backdrop-blur-xl rounded-2xl border border-green-500/30 p-4 text-center">
          <Brain className="text-green-400 mx-auto mb-2" size={24} />
          <div className="text-2xl font-black text-white">{levelData.stats.totalCardsCreated}</div>
          <div className="text-green-200 text-sm">Cards Created</div>
        </div>
        
        <div className="bg-gradient-to-br from-orange-500/20 to-red-600/20 backdrop-blur-xl rounded-2xl border border-orange-500/30 p-4 text-center">
          <Target className="text-orange-400 mx-auto mb-2" size={24} />
          <div className="text-2xl font-black text-white">{levelData.stats.totalCardsReviewed}</div>
          <div className="text-orange-200 text-sm">Cards Reviewed</div>
        </div>
        
        <div className="bg-gradient-to-br from-yellow-500/20 to-orange-600/20 backdrop-blur-xl rounded-2xl border border-yellow-500/30 p-4 text-center">
          <Flame className="text-yellow-400 mx-auto mb-2" size={24} />
          <div className="text-2xl font-black text-white">{levelData.stats.currentStreak}</div>
          <div className="text-yellow-200 text-sm">Day Streak</div>
        </div>
      </div>

      {/* Achievements */}
      {achievements.length > 0 && (
        <div className="bg-gradient-to-br from-yellow-500/20 to-orange-600/20 backdrop-blur-xl rounded-3xl border border-white/20 p-6 shadow-2xl">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            <Award className="mr-3 text-yellow-400" size={24} />
            Achievements ({achievements.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map((achievement) => (
              <div key={achievement.id} className="bg-white/10 rounded-2xl p-4 border border-white/20">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{achievement.icon}</div>
                  <div>
                    <div className="font-bold text-white">{achievement.title}</div>
                    <div className="text-yellow-200 text-sm">{achievement.description}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Next Milestone */}
      {nextMilestone && (
        <div className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 backdrop-blur-xl rounded-3xl border border-white/20 p-6 shadow-2xl">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            <Target className="mr-3 text-green-400" size={24} />
            Next Milestone
          </h3>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-lg font-bold text-white">{nextMilestone.description}</div>
              <div className="text-green-200 text-sm">Keep going to unlock this achievement!</div>
            </div>
            <div className="p-3 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl">
              <Zap className="text-white" size={24} />
            </div>
          </div>
        </div>
      )}

      {/* Dungeon XP Breakdown */}
      <div className="bg-gradient-to-br from-amber-900/20 to-black/50 backdrop-blur-xl rounded-lg border-2 border-amber-400/50 p-6 shadow-2xl">
        <h3 className="text-xl font-bold text-white mb-4 flex items-center">
          <Star className="mr-3 text-indigo-400" size={24} />
          XP Breakdown
        </h3>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-white/80">Study Sessions</span>
            <span className="text-white font-bold">{Math.round(levelData.stats.totalStudyTime / 60) * 10} XP</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-white/80">Cards Created</span>
            <span className="text-white font-bold">{levelData.stats.totalCardsCreated * 15} XP</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-white/80">Cards Reviewed</span>
            <span className="text-white font-bold">{levelData.stats.totalCardsReviewed * 5} XP</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-white/80">Streak Bonus</span>
            <span className="text-white font-bold">{levelData.stats.currentStreak * 20} XP</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-white/80">Brain Blurts</span>
            <span className="text-white font-bold">{levelData.stats.totalBlurts * 5} XP</span>
          </div>
          <div className="border-t border-white/20 pt-3 mt-3">
            <div className="flex justify-between items-center">
              <span className="text-white font-bold">Total XP</span>
              <span className="text-white font-bold text-lg">{levelData.totalXP} XP</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LevelProgress;
