"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authAndSubscription = exports.checkLimit = exports.requireFeature = exports.checkSubscription = void 0;
const models_1 = require("../models");
const auth_1 = require("./auth");
// Проверяет, есть ли у пользователя активная подписка
const checkSubscription = async (req, res, next) => {
    try {
        const currentUserId = req.user?.userId || req.user?.id;
        if (!currentUserId) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const subscription = await models_1.UserSubscription.findOne({
            where: {
                userId: currentUserId,
                status: 'active',
            },
        });
        if (subscription) {
            req.user.subscriptionPlanId = subscription.planId;
        }
        else {
            req.user.subscriptionPlanId = 'free';
        }
        next();
    }
    catch (error) {
        console.error('Subscription check error:', error);
        if (req.user)
            req.user.subscriptionPlanId = 'free';
        next();
    }
};
exports.checkSubscription = checkSubscription;
// Проверяет, есть ли у пользователя определенная функция
const requireFeature = (feature) => {
    return (req, res, next) => {
        const planId = req.user?.subscriptionPlanId || 'free';
        const plan = models_1.SUBSCRIPTION_PLANS.find(p => p.id === planId);
        if (!plan || !plan.features[feature]) {
            return res.status(403).json({
                message: 'This feature requires a premium subscription',
                requiredPlan: 'premium',
                currentPlan: planId
            });
        }
        next();
    };
};
exports.requireFeature = requireFeature;
// Проверяет лимиты подписки
const checkLimit = (limitType) => {
    return (req, res, next) => {
        const planId = req.user?.subscriptionPlanId || 'free';
        const plan = models_1.SUBSCRIPTION_PLANS.find(p => p.id === planId);
        if (!plan) {
            return res.status(400).json({ message: 'Invalid subscription plan' });
        }
        // Здесь можно добавить логику проверки текущего использования
        // Например, количество уведомлений за день
        next();
    };
};
exports.checkLimit = checkLimit;
// Middleware для проверки подписки с аутентификацией
exports.authAndSubscription = [auth_1.authenticateToken, exports.checkSubscription];
