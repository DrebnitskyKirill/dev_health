"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GamificationService = void 0;
const models_1 = require("../models");
const defaultAchievements_1 = require("../models/defaultAchievements");
const notification_1 = require("./notification");
class GamificationService {
    // Проверка и награждение достижений
    static async checkAndAwardAchievements(userId) {
        try {
            const user = await models_1.User.findByPk(userId);
            if (!user) {
                throw new Error("User not found");
            }
            const userStats = await models_1.UserStatistics.findOne({
                where: { userId },
            });
            if (!userStats) {
                throw new Error("User statistics not found");
            }
            const allAchievements = await models_1.Achievement.findAll();
            const userAchievements = await models_1.UserAchievement.findAll({
                where: { userId },
                include: [{ model: models_1.Achievement, as: "achievement" }],
            });
            const earnedAchievementIds = userAchievements.map((ua) => ua.achievementId);
            const newAchievements = [];
            let totalPoints = 0;
            for (const achievement of allAchievements) {
                if (earnedAchievementIds.includes(achievement.id)) {
                    totalPoints += achievement.points || 0;
                    continue;
                }
                if (await this.checkAchievementCondition(achievement, userStats, user)) {
                    // Награждаем достижение
                    await models_1.UserAchievement.create({
                        userId,
                        achievementId: achievement.id,
                        earnedAt: new Date(),
                    });
                    newAchievements.push(achievement);
                    totalPoints += achievement.points || 0;
                    // Отправляем email уведомление о достижении
                    try {
                        const notificationService = new notification_1.NotificationService();
                        await notificationService.sendAchievementEmail(user, achievement.name, achievement.description);
                        console.log(`Achievement notification sent to ${user.email} for ${achievement.name}`);
                    }
                    catch (emailError) {
                        console.error('Error sending achievement notification:', emailError);
                        // Не прерываем процесс, если email не отправился
                    }
                }
            }
            return { newAchievements, totalPoints };
        }
        catch (error) {
            console.error("Error checking achievements:", error);
            throw error;
        }
    }
    // Проверяем условие достижения
    static async checkAchievementCondition(achievement, userStats, user) {
        const requirements = achievement.requirements;
        for (const [key, requiredValue] of Object.entries(requirements)) {
            const userValue = userStats[key] || 0;
            if (userValue < requiredValue) {
                return false;
            }
        }
        return true;
    }
    // Обновляем опыт и уровень пользователя
    static async updateUserProgress(userId, points) {
        try {
            const user = await models_1.User.findByPk(userId);
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
        }
        catch (error) {
            console.error("Error updating user progress:", error);
            throw error;
        }
    }
    // Расчет уровня на основе опыта
    static calculateLevel(experience) {
        // Простая формула: каждые 100 очков = 1 уровень
        return Math.floor(experience / 100) + 1;
    }
    // Получение лидерборда
    static async getLeaderboard(limit = 10) {
        const users = await models_1.User.findAll({
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
    static async updateUserStatistics(userId, updates) {
        const [userStats, created] = await models_1.UserStatistics.findOrCreate({
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
        await models_1.User.update({ healthScore }, { where: { id: userId } });
        // Проверяем достижения
        await this.checkAndAwardAchievements(userId);
    }
    // Расчет health score
    static calculateHealthScore(stats) {
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
    static async initializeAchievements() {
        const achievementCount = await models_1.Achievement.count();
        if (achievementCount === 0) {
            await models_1.Achievement.bulkCreate(defaultAchievements_1.defaultAchievements);
            console.log('Default achievements initialized');
        }
    }
    // Получение статистики пользователя
    static async getUserStatistics(userId) {
        return await models_1.UserStatistics.findOne({
            where: { userId },
        });
    }
    // Получение достижений пользователя
    static async getUserAchievements(userId) {
        const userAchievements = await models_1.UserAchievement.findAll({
            where: { userId },
            include: [models_1.Achievement],
            order: [['earnedAt', 'DESC']],
        });
        return userAchievements.map((ua) => ({
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
exports.GamificationService = GamificationService;
