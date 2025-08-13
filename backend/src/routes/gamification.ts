import express from 'express';
import jwt from 'jsonwebtoken';
import { GamificationService } from '../services/gamification';
import { Achievement, UserAchievement } from '../models';

const router = express.Router();

// Middleware для проверки токена
const authenticateToken = (req: any, res: any, next: any) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  
      if (!token) {
      return res.status(401).json({ message: 'Token not provided' });
    }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    (req as any).user = decoded;
    next();
  } catch (error) {
          return res.status(401).json({ message: 'Invalid token' });
  }
};

// Получение всех достижений
router.get('/achievements', async (req, res) => {
  try {
    const achievements = await Achievement.findAll({
      order: [['points', 'DESC']],
    });

    res.json(achievements);
  } catch (error) {
    console.error('Get achievements error:', error);
    res.status(500).json({ message: 'Ошибка при получении достижений' });
  }
});

// Получение достижений, статистики и уровня пользователя
router.get('/user-achievements', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.userId;

    const [userAchievements, userStats] = await Promise.all([
      GamificationService.getUserAchievements(userId),
      GamificationService.getUserStatistics(userId),
    ]);

    // Получаем информацию о пользователе
    const { User } = await import('../models');
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
  } catch (error) {
    console.error('Get user achievements error:', error);
    res.status(500).json({ message: 'Ошибка при получении данных пользователя' });
  }
});

// Получение лидерборда
router.get('/leaderboard', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit as string) || 10;
    const leaderboard = await GamificationService.getLeaderboard(limit);

    res.json({ leaderboard });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    res.status(500).json({ message: 'Ошибка при получении лидерборда' });
  }
});

// Получение статистики пользователя
router.get('/statistics', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const statistics = await GamificationService.getUserStatistics(userId);

    if (!statistics) {
      return res.status(404).json({ message: 'Статистика не найдена' });
    }

    res.json(statistics);
  } catch (error) {
    console.error('Get statistics error:', error);
    res.status(500).json({ message: 'Ошибка при получении статистики' });
  }
});

// Обновление статистики пользователя
router.post('/update-statistics', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.userId;
    const updates = req.body;

    await GamificationService.updateUserStatistics(userId, updates);

    res.json({ message: 'Статистика обновлена' });
  } catch (error) {
    console.error('Update statistics error:', error);
    res.status(500).json({ message: 'Ошибка при обновлении статистики' });
  }
});

export default router;
