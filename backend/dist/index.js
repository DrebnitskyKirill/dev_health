"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const models_1 = require("./models");
const gamification_1 = require("./services/gamification");
// Загружаем переменные окружения
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3001;
// Security & Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({ origin: process.env.CORS_ORIGIN || '*' }));
app.use((0, express_rate_limit_1.default)({ windowMs: 15 * 60 * 1000, max: 100 }));
app.use((0, morgan_1.default)('combined'));
app.use(express_1.default.json());
// Роуты
const auth_1 = __importDefault(require("./routes/auth"));
const gamification_2 = __importDefault(require("./routes/gamification"));
const subscription_1 = __importDefault(require("./routes/subscription"));
const notifications_1 = __importDefault(require("./routes/notifications"));
app.use('/api/auth', auth_1.default);
app.use('/api/gamification', gamification_2.default);
app.use('/api/subscription', subscription_1.default);
app.use('/api/notifications', notifications_1.default);
// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK', timestamp: new Date().toISOString() });
});
// События осанки
app.post('/api/posture', (req, res) => {
    const event = req.body;
    console.log('Posture event:', event);
    res.json({ message: 'Posture event recorded' });
});
// События моргания
app.post('/api/blink', (req, res) => {
    const event = req.body;
    console.log('Blink event:', event);
    res.json({ message: 'Blink event recorded' });
});
// Запуск сервера
const startServer = async () => {
    try {
        // Подключение к PostgreSQL
        await models_1.sequelize.authenticate();
        console.log('Connected to PostgreSQL');
        // Синхронизация моделей с базой данных
        await models_1.sequelize.sync({ alter: true });
        console.log('Database synchronized');
        // Инициализируем достижения при запуске
        await gamification_1.GamificationService.initializeAchievements();
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
    }
    catch (error) {
        console.error('Database connection error:', error);
        process.exit(1);
    }
};
startServer();
