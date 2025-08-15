"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const models_1 = require("../models");
class NotificationService {
    constructor() {
        // Создаем транспортер для отправки email
        // В продакшене здесь будут реальные SMTP настройки
        this.transporter = nodemailer_1.default.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: false, // true для 465, false для других портов
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }
    // Отправка email уведомления
    async sendEmail(notification) {
        try {
            const mailOptions = {
                from: process.env.SMTP_FROM,
                to: notification.to,
                subject: notification.subject,
                html: notification.html,
                text: notification.text || this.htmlToText(notification.html),
            };
            const result = await this.transporter.sendMail(mailOptions);
            console.log('Email sent successfully:', result.messageId);
            return true;
        }
        catch (error) {
            console.error('Error sending email:', error);
            return false;
        }
    }
    // Конвертация HTML в текст для fallback
    htmlToText(html) {
        return html
            .replace(/<[^>]*>/g, '')
            .replace(/&nbsp;/g, ' ')
            .replace(/&amp;/g, '&')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"')
            .trim();
    }
    // Шаблоны уведомлений
    static getTemplates() {
        return {
            welcome: {
                subject: 'Добро пожаловать в DevHealth! 🎉',
                html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #2563eb;">Добро пожаловать в DevHealth!</h2>
            <p>Привет! 👋</p>
            <p>Мы рады, что вы присоединились к нашему сообществу людей, заботящихся о своем здоровье во время работы за компьютером.</p>
            <h3 style="color: #059669;">Что вас ждет:</h3>
            <ul>
              <li>📊 Мониторинг осанки в реальном времени</li>
              <li>👁️ Напоминания о правиле 20-20-20 для зрения</li>
              <li>⏰ Таймер Помодоро для продуктивной работы</li>
              <li>🏆 Система достижений и геймификации</li>
              <li>📈 Аналитика вашего здоровья</li>
            </ul>
            <p>Начните прямо сейчас с мониторинга осанки или установите напоминания для зрения!</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="http://localhost:3000" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Открыть приложение</a>
            </div>
            <p style="color: #6b7280; font-size: 14px;">С уважением, команда DevHealth</p>
          </div>
        `,
            },
            achievement: {
                subject: '🎉 Новое достижение разблокировано!',
                html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #f59e0b;">Поздравляем с новым достижением!</h2>
            <p>Вы разблокировали новое достижение в DevHealth!</p>
            <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #92400e; margin-top: 0;">🏆 {achievementName}</h3>
              <p style="color: #92400e; margin-bottom: 0;">{achievementDescription}</p>
            </div>
            <p>Продолжайте работать над своими привычками здоровья и разблокируйте еще больше достижений!</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="http://localhost:3000/profile" style="background-color: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Посмотреть профиль</a>
            </div>
            <p style="color: #6b7280; font-size: 14px;">С уважением, команда DevHealth</p>
          </div>
        `,
            },
            dailyReminder: {
                subject: '💡 Напоминание о здоровье на сегодня',
                html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #059669;">Напоминание о здоровье</h2>
            <p>Привет! Не забудьте позаботиться о своем здоровье сегодня:</p>
            <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #065f46; margin-top: 0;">📋 План на сегодня:</h3>
              <ul style="color: #065f46;">
                <li>🧍 Проверьте осанку за компьютером</li>
                <li>👁️ Делайте перерывы для зрения каждые 20 минут</li>
                <li>⏰ Используйте таймер Помодоро для продуктивной работы</li>
                <li>💧 Не забывайте пить воду</li>
                <li>🚶 Делайте короткие перерывы для движения</li>
              </ul>
            </div>
            <p>Маленькие шаги каждый день приводят к большим результатам!</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="http://localhost:3000" style="background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Открыть приложение</a>
            </div>
            <p style="color: #6b7280; font-size: 14px;">С уважением, команда DevHealth</p>
          </div>
        `,
            },
            weeklyReport: {
                subject: '📊 Ваш еженедельный отчет о здоровье',
                html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #7c3aed;">Еженедельный отчет о здоровье</h2>
            <p>Вот ваш прогресс за прошедшую неделю:</p>
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #374151; margin-top: 0;">📈 Статистика недели:</h3>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                <div style="text-align: center;">
                  <div style="font-size: 24px; font-weight: bold; color: #2563eb;">{healthScore}</div>
                  <div style="color: #6b7280;">Очки здоровья</div>
                </div>
                <div style="text-align: center;">
                  <div style="font-size: 24px; font-weight: bold; color: #059669;">{level}</div>
                  <div style="color: #6b7280;">Уровень</div>
                </div>
                <div style="text-align: center;">
                  <div style="font-size: 24px; font-weight: bold; color: #f59e0b;">{sessionsCompleted}</div>
                  <div style="color: #6b7280;">Сессий завершено</div>
                </div>
                <div style="text-align: center;">
                  <div style="font-size: 24px; font-weight: bold; color: #dc2626;">{remindersShown}</div>
                  <div style="color: #6b7280;">Напоминаний показано</div>
                </div>
              </div>
            </div>
            <p>Отличная работа! Продолжайте в том же духе на следующей неделе.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="http://localhost:3000/profile" style="background-color: #7c3aed; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Посмотреть детали</a>
            </div>
            <p style="color: #6b7280; font-size: 14px;">С уважением, команда DevHealth</p>
          </div>
        `,
            },
        };
    }
    // Отправка приветственного email
    async sendWelcomeEmail(user) {
        const template = NotificationService.getTemplates().welcome;
        return this.sendEmail({
            to: user.email,
            subject: template.subject,
            html: template.html,
        });
    }
    // Отправка уведомления о достижении
    async sendAchievementEmail(user, achievementName, achievementDescription) {
        const template = NotificationService.getTemplates().achievement;
        const html = template.html
            .replace('{achievementName}', achievementName)
            .replace('{achievementDescription}', achievementDescription);
        return this.sendEmail({
            to: user.email,
            subject: template.subject,
            html: html,
        });
    }
    // Отправка ежедневного напоминания
    async sendDailyReminder(user) {
        const template = NotificationService.getTemplates().dailyReminder;
        return this.sendEmail({
            to: user.email,
            subject: template.subject,
            html: template.html,
        });
    }
    // Отправка еженедельного отчета
    async sendWeeklyReport(user, stats) {
        const template = NotificationService.getTemplates().weeklyReport;
        const html = template.html
            .replace('{healthScore}', stats.healthScore.toString())
            .replace('{level}', stats.level.toString())
            .replace('{sessionsCompleted}', stats.sessionsCompleted.toString())
            .replace('{remindersShown}', stats.remindersShown.toString());
        return this.sendEmail({
            to: user.email,
            subject: template.subject,
            html: html,
        });
    }
    // Массовая рассылка всем пользователям
    async sendBulkEmail(templateKey, customData) {
        try {
            const users = await models_1.User.findAll();
            const template = NotificationService.getTemplates()[templateKey];
            if (!template) {
                throw new Error(`Template ${templateKey} not found`);
            }
            let html = template.html;
            if (customData) {
                Object.entries(customData).forEach(([key, value]) => {
                    html = html.replace(new RegExp(`{${key}}`, 'g'), value);
                });
            }
            let sent = 0;
            let failed = 0;
            for (const user of users) {
                const success = await this.sendEmail({
                    to: user.email,
                    subject: template.subject,
                    html: html,
                });
                if (success) {
                    sent++;
                }
                else {
                    failed++;
                }
                // Небольшая задержка между отправками
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            return {
                total: users.length,
                sent,
                failed,
            };
        }
        catch (error) {
            console.error('Error sending bulk email:', error);
            return {
                total: 0,
                sent: 0,
                failed: 0,
            };
        }
    }
}
exports.NotificationService = NotificationService;
