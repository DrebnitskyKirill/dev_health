import React, { useState, useEffect } from 'react';
import { useAuth } from '../../shared/context/AuthContext';
import { useLanguage } from '../../shared/context/LanguageContext';
import { Card } from '../../shared/ui/Card';

interface Achievement {
  type: string;
  name: string;
  description: string;
  earnedAt: string;
  progress: number;
  maxProgress: number;
  icon?: string;
  points?: number;
  rarity?: string;
}

interface UserAchievements {
  achievements: Achievement[];
  badges: string[];
  healthScore: number;
  level: number;
  experience: number;
}

export const AchievementsWidget: React.FC = () => {
  const { user, token } = useAuth();
  const { t } = useLanguage();
  const [userAchievements, setUserAchievements] = useState<UserAchievements | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (token && user) {
      fetchUserAchievements();
    }
  }, [token, user]);

  const fetchUserAchievements = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('http://localhost:3001/api/gamification/user-achievements', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUserAchievements(data);
      }
    } catch (error) {
      console.error('Error fetching achievements:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  if (isLoading) {
    return (
      <Card>
        <div className="animate-pulse" data-testid="loading-skeleton">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </Card>
    );
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'bg-gray-100 text-gray-800';
      case 'rare': return 'bg-blue-100 text-blue-800';
      case 'epic': return 'bg-purple-100 text-purple-800';
      case 'legendary': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getRarityLabel = (rarity: string) => {
    switch (rarity) {
      case 'common': return 'Common';
      case 'rare': return 'Rare';
      case 'epic': return 'Epic';
      case 'legendary': return 'Legendary';
      default: return 'Common';
    }
  };

  return (
    <div className="space-y-6">
      {/* Статистика пользователя */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{t('achievements.yourProfile')}</h3>
          <div className="text-sm text-gray-500">{t('dashboard.level')} {user.level}</div>
        </div>
        
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-600">{user.healthScore}</div>
            <div className="text-sm text-gray-500">{t('dashboard.healthPoints')}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{user.badges?.length || 0}</div>
            <div className="text-sm text-gray-500">{t('dashboard.badges')}</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{userAchievements?.achievements.length || 0}</div>
            <div className="text-sm text-gray-500">{t('dashboard.achievements')}</div>
          </div>
        </div>

        {/* Прогресс уровня */}
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-500 mb-1">
            <span>{t('dashboard.experience')}</span>
            <span>{userAchievements?.experience || 0} / {(user.level * 100)}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${Math.min(100, ((userAchievements?.experience || 0) / (user.level * 100)) * 100)}%` 
              }}
            ></div>
          </div>
        </div>
      </Card>

      {/* Бейджи */}
      {user.badges && user.badges.length > 0 && (
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('achievements.yourBadges')}</h3>
          <div className="flex flex-wrap gap-2">
            {user.badges.map((badge, index) => (
              <div
                key={index}
                className="px-3 py-1 bg-indigo-100 text-indigo-800 text-sm rounded-full font-medium"
              >
                {badge}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Достижения */}
      {userAchievements?.achievements && userAchievements.achievements.length > 0 && (
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('achievements.earnedAchievements')}</h3>
          <div className="space-y-3">
            {userAchievements.achievements.map((achievement, index) => (
              <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                <div className="text-2xl mr-3">{achievement.icon || '🏆'}</div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">{achievement.name}</div>
                  <div className="text-sm text-gray-600">{achievement.description}</div>
                                     <div className="text-xs text-gray-500 mt-1">
                     {t('achievements.earned')} {new Date(achievement.earnedAt).toLocaleDateString()}
                   </div>
                </div>
                {achievement.points && (
                  <div className="text-right">
                    <div className="text-sm font-medium text-indigo-600">+{achievement.points}</div>
                    {achievement.rarity && (
                      <div className={`text-xs px-2 py-1 rounded ${getRarityColor(achievement.rarity)}`}>
                        {getRarityLabel(achievement.rarity)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
