"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionService = void 0;
const models_1 = require("../models");
class SubscriptionService {
    // Получает текущий план подписки пользователя
    static async getUserPlan(userId) {
        try {
            const subscription = await models_1.UserSubscription.findOne({
                where: {
                    userId,
                    status: 'active',
                },
            });
            return subscription?.planId || 'free';
        }
        catch (error) {
            console.error('Error getting user plan:', error);
            return 'free';
        }
    }
    // Проверяет, есть ли у пользователя определенная функция
    static hasFeature(userPlanId, feature) {
        const plan = models_1.SUBSCRIPTION_PLANS.find(p => p.id === userPlanId);
        return plan ? plan.features[feature] : false;
    }
    // Получает лимиты плана пользователя
    static getPlanLimits(userPlanId) {
        const plan = models_1.SUBSCRIPTION_PLANS.find(p => p.id === userPlanId);
        return plan ? plan.limits : models_1.SUBSCRIPTION_PLANS[0].limits;
    }
    // Создает новую подписку
    static async createSubscription(userId, planId, stripeSubscriptionId, stripeCustomerId) {
        const plan = models_1.SUBSCRIPTION_PLANS.find(p => p.id === planId);
        if (!plan) {
            throw new Error('Invalid subscription plan');
        }
        // Отменяем текущую активную подписку
        await models_1.UserSubscription.update({ status: 'canceled' }, {
            where: {
                userId,
                status: 'active',
            },
        });
        // Создаем новую подписку
        const startDate = new Date();
        const endDate = new Date();
        endDate.setMonth(endDate.getMonth() + 1); // +1 месяц
        const subscription = await models_1.UserSubscription.create({
            userId,
            planId,
            status: 'active',
            startDate,
            endDate,
            stripeSubscriptionId,
            stripeCustomerId,
        });
        // Обновляем план пользователя
        await models_1.User.update({ subscriptionPlanId: planId }, { where: { id: userId } });
        return subscription;
    }
    // Отменяет подписку
    static async cancelSubscription(userId) {
        await models_1.UserSubscription.update({ status: 'canceled' }, {
            where: {
                userId,
                status: 'active',
            },
        });
        // Возвращаем пользователя на бесплатный план
        await models_1.User.update({ subscriptionPlanId: 'free' }, { where: { id: userId } });
    }
    // Проверяет, не истекла ли подписка
    static async checkExpiredSubscriptions() {
        const expiredSubscriptions = await models_1.UserSubscription.findAll({
            where: {
                status: 'active',
                endDate: {
                    [require('sequelize').Op.lt]: new Date(),
                },
            },
        });
        for (const subscription of expiredSubscriptions) {
            await this.cancelSubscription(subscription.userId);
        }
    }
    // Получает статистику подписок
    static async getSubscriptionStats() {
        const stats = await models_1.UserSubscription.findAll({
            attributes: [
                'planId',
                'status',
                [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count'],
            ],
            group: ['planId', 'status'],
        });
        return stats;
    }
}
exports.SubscriptionService = SubscriptionService;
