"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const gamification_1 = require("../services/gamification");
const models_1 = require("../models");
const router = express_1.default.Router();
// Middleware для проверки токена
const authenticateToken = (req, res, next) => {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
        return res.status(401).json({ message: 'Token not provided' });
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        req.user = decoded;
        next();
    }
    catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
};
// Получение всех достижений
router.get('/achievements', async (req, res) => {
    try {
        const achievements = await models_1.Achievement.findAll({
            order: [['points', 'DESC']],
        });
        res.json(achievements);
    }
    catch (error) {
        console.error('Get achievements error:', error);
        res.status(500).json({ message: 'Ошибка при получении достижений' });
    }
});
// Получение достижений, статистики и уровня пользователя
router.get('/user-achievements', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const [userAchievements, userStats] = await Promise.all([
            gamification_1.GamificationService.getUserAchievements(userId),
            gamification_1.GamificationService.getUserStatistics(userId),
        ]);
        // Получаем информацию о пользователе
        const { User } = await Promise.resolve().then(() => __importStar(require('../models')));
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'Пользователь не найден' });
        }
        res.json({
            user: {
                id: user.id,
                username: user.username,
                healthScore: user.healthScore,
                level: user.level,
                experience: user.experience,
                badges: user.badges || [],
            },
            statistics: userStats,
            achievements: userAchievements,
        });
    }
    catch (error) {
        console.error('Get user achievements error:', error);
        res.status(500).json({ message: 'Ошибка при получении данных пользователя' });
    }
});
// Получение лидерборда
router.get('/leaderboard', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const leaderboard = await gamification_1.GamificationService.getLeaderboard(limit);
        res.json({ leaderboard });
    }
    catch (error) {
        console.error('Get leaderboard error:', error);
        res.status(500).json({ message: 'Ошибка при получении лидерборда' });
    }
});
// Получение статистики пользователя
router.get('/statistics', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const statistics = await gamification_1.GamificationService.getUserStatistics(userId);
        if (!statistics) {
            return res.status(404).json({ message: 'Статистика не найдена' });
        }
        res.json(statistics);
    }
    catch (error) {
        console.error('Get statistics error:', error);
        res.status(500).json({ message: 'Ошибка при получении статистики' });
    }
});
// Обновление статистики пользователя
router.post('/update-statistics', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.userId;
        const updates = req.body;
        await gamification_1.GamificationService.updateUserStatistics(userId, updates);
        res.json({ message: 'Статистика обновлена' });
    }
    catch (error) {
        console.error('Update statistics error:', error);
        res.status(500).json({ message: 'Ошибка при обновлении статистики' });
    }
});
exports.default = router;
