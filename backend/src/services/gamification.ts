import { User, Achievement, UserAchievement, UserStatistics } from '../models';
import { Op } from 'sequelize';
import { defaultAchievements } from '../models/defaultAchievements';
import { NotificationService } from "./notification";

export class GamificationService {
  // Проверка и награждение достижений
  static async checkAndAwardAchievements(userId: number): Promise<{
    newAchievements: Achievement[];
    totalPoints: number;
  }> {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error("User not found");
      }

      const userStats = await UserStatistics.findOne({
        where: { userId },
      });

      if (!userStats) {
        throw new Error("User statistics not found");
      }

      const allAchievements = await Achievement.findAll();
      const userAchievements = await UserAchievement.findAll({
        where: { userId },
        include: [{ model: Achievement, as: "achievement" }],
      });

      const earnedAchievementIds = userAchievements.map((ua) => ua.achievementId);
      const newAchievements: Achievement[] = [];
      let totalPoints = 0;

      for (const achievement of allAchievements) {
        if (earnedAchievementIds.includes(achievement.id)) {
          totalPoints += achievement.points || 0;
          continue;
        }

        if (await this.checkAchievementCondition(achievement, userStats, user)) {
          // Награждаем достижение
          await UserAchievement.create({
            userId,
            achievementId: achievement.id,
            earnedAt: new Date(),
          });

          newAchievements.push(achievement);
          totalPoints += achievement.points || 0;

          // Отправляем email уведомление о достижении
          try {
            const notificationService = new NotificationService();
            await notificationService.sendAchievementEmail(
              user,
              achievement.name,
              achievement.description
            );
            console.log(`Achievement notification sent to ${user.email} for ${achievement.name}`);
          } catch (emailError) {
            console.error('Error sending achievement notification:', emailError);
            // Не прерываем процесс, если email не отправился
          }
        }
      }

      return { newAchievements, totalPoints };
    } catch (error) {
      console.error("Error checking achievements:", error);
      throw error;
    }
  }

  // Проверяем условие достижения
  private static async checkAchievementCondition(
    achievement: Achievement,
    userStats: UserStatistics,
    user: User
  ): Promise<boolean> {
    const requirements = achievement.requirements;
    
    for (const [key, requiredValue] of Object.entries(requirements)) {
      const userValue = (userStats as any)[key] || 0;
      
      if (userValue < requiredValue) {
        return false;
      }
    }
    
    return true;
  }

  // Обновляем опыт и уровень пользователя
  static async updateUserProgress(userId: number, points: number): Promise<void> {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error("User not found");
      }

      const newExperience = user.experience + points;
      const newLevel = this.calculateLevel(newExperience);
      
      await user.update({
        experience: newExperience,
        level: newLevel,
      });

      // Проверяем новые достижения
      await this.checkAndAwardAchievements(userId);
    } catch (error) {
      console.error("Error updating user progress:", error);
      throw error;
    }
  }

  // Расчет уровня на основе опыта
  static calculateLevel(experience: number): number {
    // Простая формула: каждые 100 очков = 1 уровень
    return Math.floor(experience / 100) + 1;
  }

  // Получение лидерборда
  static async getLeaderboard(limit: number = 10): Promise<any[]> {
    const users = await User.findAll({
      attributes: ['id', 'username', 'healthScore', 'level', 'experience', 'badges'],
      order: [['healthScore', 'DESC']],
      limit,
    });

    return users.map(user => ({
      id: user.id,
      username: user.username,
      healthScore: user.healthScore,
      level: user.level,
      experience: user.experience,
      badges: user.badges || [],
    }));
  }

  // Обновление статистики пользователя
  static async updateUserStatistics(
    userId: number,
    updates: Partial<{
      totalWorkTime: number;
      goodPostureTime: number;
      blinkReminders: number;
      pomodoroSessions: number;
      consecutiveGoodPostureDays: number;
      lastPostureCheck: Date;
    }>
  ): Promise<void> {
    const [userStats, created] = await UserStatistics.findOrCreate({
      where: { userId },
      defaults: {
        userId,
        totalWorkTime: 0,
        goodPostureTime: 0,
        blinkReminders: 0,
        pomodoroSessions: 0,
        consecutiveGoodPostureDays: 0,
      },
    });

    // Обновляем статистику
    await userStats.update(updates);

    // Пересчитываем health score
    const healthScore = this.calculateHealthScore(userStats);
    
    // Обновляем health score пользователя
    await User.update(
      { healthScore },
      { where: { id: userId } }
    );

    // Проверяем достижения
    await this.checkAndAwardAchievements(userId);
  }

  // Расчет health score
  static calculateHealthScore(stats: any): number {
    let score = 0;
    
    // Базовые очки за каждый тип активности
    score += Math.floor(stats.totalWorkTime / 60000) * 0.1; // 1 очко за каждую минуту работы
    score += Math.floor(stats.goodPostureTime / 60000) * 0.2; // 2 очка за каждую минуту хорошей осанки
    score += stats.blinkReminders * 1; // 1 очко за каждое напоминание
    score += stats.pomodoroSessions * 5; // 5 очков за каждый помодоро-сеанс
    score += stats.consecutiveGoodPostureDays * 10; // 10 очков за каждый день подряд

    return Math.floor(score);
  }

  // Инициализация достижений
  static async initializeAchievements(): Promise<void> {
    const achievementCount = await Achievement.count();
    
    if (achievementCount === 0) {
      await Achievement.bulkCreate(defaultAchievements as any);
      console.log('Default achievements initialized');
    }
  }

  // Получение статистики пользователя
  static async getUserStatistics(userId: number): Promise<any | null> {
    return await UserStatistics.findOne({
      where: { userId },
    });
  }

  // Получение достижений пользователя
  static async getUserAchievements(userId: number): Promise<any[]> {
    const userAchievements = await UserAchievement.findAll({
      where: { userId },
      include: [Achievement],
      order: [['earnedAt', 'DESC']],
    });

    return userAchievements.map((ua: any) => ({
      id: ua.achievement.id,
      name: ua.achievement.name,
      description: ua.achievement.description,
      type: ua.achievement.type,
      icon: ua.achievement.icon,
      points: ua.achievement.points,
      rarity: ua.achievement.rarity,
      earnedAt: ua.earnedAt,
    }));
  }
}
