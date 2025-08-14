import { Router, Response } from "express";
import { authenticateToken, AuthRequest } from "../middleware/auth";
import { NotificationService } from "../services/notification";
import { User } from "../models";

const router = Router();

// Отправка тестового email
router.post("/test", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const notificationService = new NotificationService();
    const success = await notificationService.sendWelcomeEmail(user);

    if (success) {
      res.json({ message: "Test email sent successfully" });
    } else {
      res.status(500).json({ message: "Failed to send test email" });
    }
  } catch (error) {
    console.error("Error sending test email:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Отправка приветственного email
router.post("/welcome", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const notificationService = new NotificationService();
    const success = await notificationService.sendWelcomeEmail(user);

    if (success) {
      res.json({ message: "Welcome email sent successfully" });
    } else {
      res.status(500).json({ message: "Failed to send welcome email" });
    }
  } catch (error) {
    console.error("Error sending welcome email:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Отправка уведомления о достижении
router.post("/achievement", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { achievementName, achievementDescription } = req.body;
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    if (!achievementName || !achievementDescription) {
      return res.status(400).json({ message: "Achievement name and description are required" });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const notificationService = new NotificationService();
    const success = await notificationService.sendAchievementEmail(
      user, 
      achievementName, 
      achievementDescription
    );

    if (success) {
      res.json({ message: "Achievement email sent successfully" });
    } else {
      res.status(500).json({ message: "Failed to send achievement email" });
    }
  } catch (error) {
    console.error("Error sending achievement email:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Отправка ежедневного напоминания
router.post("/daily-reminder", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const notificationService = new NotificationService();
    const success = await notificationService.sendDailyReminder(user);

    if (success) {
      res.json({ message: "Daily reminder sent successfully" });
    } else {
      res.status(500).json({ message: "Failed to send daily reminder" });
    }
  } catch (error) {
    console.error("Error sending daily reminder:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Отправка еженедельного отчета
router.post("/weekly-report", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { healthScore, level, sessionsCompleted, remindersShown } = req.body;
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const notificationService = new NotificationService();
    const success = await notificationService.sendWeeklyReport(user, {
      healthScore: healthScore || 0,
      level: level || 1,
      sessionsCompleted: sessionsCompleted || 0,
      remindersShown: remindersShown || 0,
    });

    if (success) {
      res.json({ message: "Weekly report sent successfully" });
    } else {
      res.status(500).json({ message: "Failed to send weekly report" });
    }
  } catch (error) {
    console.error("Error sending weekly report:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Массовая рассылка (только для админов)
router.post("/bulk", authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { templateKey, customData } = req.body;
    const userId = req.user?.userId;
    
    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    // В реальном приложении здесь должна быть проверка на админа
    // Пока что разрешаем всем аутентифицированным пользователям
    if (!templateKey) {
      return res.status(400).json({ message: "Template key is required" });
    }

    const notificationService = new NotificationService();
    const result = await notificationService.sendBulkEmail(templateKey, customData);

    res.json({
      message: "Bulk email completed",
      result: result,
    });
  } catch (error) {
    console.error("Error sending bulk email:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Получение доступных шаблонов
router.get("/templates", authenticateToken, (req: AuthRequest, res: Response) => {
  try {
    const templates = NotificationService.getTemplates();
    const templateKeys = Object.keys(templates).map(key => ({
      key,
      subject: templates[key].subject,
    }));
    
    res.json({ templates: templateKeys });
  } catch (error) {
    console.error("Error getting templates:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default router;
