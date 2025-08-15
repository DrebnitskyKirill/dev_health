"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const notification_1 = require("../services/notification");
const router = express_1.default.Router();
// Регистрация
router.post('/register', async (req, res) => {
    try {
        const { email, password, username } = req.body;
        // Проверяем, существует ли пользователь
        const existingUser = await User_1.default.findOne({
            where: { email },
        });
        if (existingUser) {
            return res.status(400).json({
                message: "User with this email already exists",
            });
        }
        // Хешируем пароль
        const hashedPassword = await User_1.default.hashPassword(password);
        // Создаем пользователя
        const user = await User_1.default.create({
            email,
            password: hashedPassword,
            username,
            healthScore: 100,
            level: 1,
            experience: 0,
            badges: [],
        });
        // Генерируем JWT токен
        const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET || "your-secret-key", { expiresIn: "7d" });
        // Отправляем приветственный email
        try {
            const notificationService = new notification_1.NotificationService();
            await notificationService.sendWelcomeEmail(user);
            console.log(`Welcome email sent to ${user.email}`);
        }
        catch (emailError) {
            console.error('Error sending welcome email:', emailError);
            // Не прерываем регистрацию, если email не отправился
        }
        res.status(201).json({
            message: "User registered successfully",
            token,
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                healthScore: user.healthScore,
                level: user.level,
                experience: user.experience,
                badges: user.badges,
            },
        });
    }
    catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({
            message: "Internal server error",
        });
    }
});
// Вход
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        // Ищем пользователя
        const user = await User_1.default.findOne({
            where: { email },
        });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        // Проверяем пароль
        const isValidPassword = await user.comparePassword(password);
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        // Генерируем JWT токен
        const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '7d' });
        res.json({
            message: 'Successful login',
            token,
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                healthScore: user.healthScore,
                level: user.level,
                experience: user.experience,
                badges: user.badges || [],
            },
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Login error' });
    }
});
// Получение профиля
router.get('/profile', async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ message: 'Token not provided' });
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const user = await User_1.default.findByPk(decoded.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                healthScore: user.healthScore,
                level: user.level,
                experience: user.experience,
                badges: user.badges || [],
            },
        });
    }
    catch (error) {
        console.error('Profile error:', error);
        res.status(401).json({ message: 'Invalid token' });
    }
});
// Обновление профиля
router.put('/profile', async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ message: 'Token not provided' });
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const { username } = req.body;
        const user = await User_1.default.findByPk(decoded.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Проверяем, не занят ли username
        if (username && username !== user.username) {
            const existingUser = await User_1.default.findOne({
                where: { username },
            });
            if (existingUser) {
                return res.status(400).json({ message: 'Username already taken' });
            }
        }
        // Обновляем пользователя
        await user.update({ username });
        res.json({
            message: 'Profile updated',
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                healthScore: user.healthScore,
                level: user.level,
                experience: user.experience,
                badges: user.badges || [],
            },
        });
    }
    catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ message: 'Profile update error' });
    }
});
// Смена пароля
router.post('/change-password', async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ message: 'Token not provided' });
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const { currentPassword, newPassword } = req.body;
        const user = await User_1.default.findByPk(decoded.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        // Проверяем текущий пароль
        const isValidPassword = await user.comparePassword(currentPassword);
        if (!isValidPassword) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }
        // Проверяем длину нового пароля
        if (newPassword.length < 6) {
            return res.status(400).json({ message: 'New password must be at least 6 characters long' });
        }
        // Хешируем новый пароль
        const hashedNewPassword = await User_1.default.hashPassword(newPassword);
        // Обновляем пароль
        await user.update({ password: hashedNewPassword });
        res.json({
            message: 'Password changed successfully',
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                healthScore: user.healthScore,
                level: user.level,
                experience: user.experience,
                badges: user.badges || [],
            },
        });
    }
    catch (error) {
        console.error('Password change error:', error);
        res.status(500).json({ message: 'Password change error' });
    }
});
exports.default = router;
