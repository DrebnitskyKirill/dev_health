import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { sequelize } from './models';
import { GamificationService } from './services/gamification';

// Загружаем переменные окружения
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());

// Типы для событий
interface PostureEvent {
  timestamp: number;
  isGoodPosture: boolean;
  userId?: number;
}

interface BlinkEvent {
  timestamp: number;
  userId?: number;
}

// Роуты
import authRoutes from './routes/auth';
import gamificationRoutes from './routes/gamification';

app.use('/api/auth', authRoutes);
app.use('/api/gamification', gamificationRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// События осанки
app.post('/api/posture', (req, res) => {
  const event: PostureEvent = req.body;
  console.log('Posture event:', event);
  res.json({ message: 'Posture event recorded' });
});

// События моргания
app.post('/api/blink', (req, res) => {
  const event: BlinkEvent = req.body;
  console.log('Blink event:', event);
  res.json({ message: 'Blink event recorded' });
});

// Запуск сервера
const startServer = async () => {
  try {
    // Подключение к PostgreSQL
    await sequelize.authenticate();
    console.log('Connected to PostgreSQL');

    // Синхронизация моделей с базой данных
    await sequelize.sync({ alter: true });
    console.log('Database synchronized');

    // Инициализируем достижения при запуске
    await GamificationService.initializeAchievements();

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

startServer();


