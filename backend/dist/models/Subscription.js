"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserSubscription = exports.SUBSCRIPTION_PLANS = void 0;
const sequelize_1 = require("sequelize");
const index_1 = require("./index");
exports.SUBSCRIPTION_PLANS = [
    {
        id: 'free',
        name: 'Free',
        price: 0,
        currency: 'USD',
        interval: 'month',
        features: {
            basicMonitoring: true,
            advancedAnalytics: false,
            integrations: false,
            gamification: false,
            customNotifications: false,
            dataExport: false,
            prioritySupport: false,
            teamFeatures: false,
            aiInsights: false,
            healthReports: false,
        },
        limits: {
            maxNotificationsPerDay: 5,
            maxDataRetentionDays: 7,
            maxTeamMembers: 1,
            maxCustomGoals: 2,
        },
    },
    {
        id: 'premium',
        name: 'Premium',
        price: 5,
        currency: 'USD',
        interval: 'month',
        features: {
            basicMonitoring: true,
            advancedAnalytics: true,
            integrations: true,
            gamification: true,
            customNotifications: true,
            dataExport: true,
            prioritySupport: true,
            teamFeatures: false,
            aiInsights: false,
            healthReports: false,
        },
        limits: {
            maxNotificationsPerDay: 50,
            maxDataRetentionDays: 365,
            maxTeamMembers: 1,
            maxCustomGoals: 10,
        },
    },
    {
        id: 'pro',
        name: 'Pro',
        price: 15,
        currency: 'USD',
        interval: 'month',
        features: {
            basicMonitoring: true,
            advancedAnalytics: true,
            integrations: true,
            gamification: true,
            customNotifications: true,
            dataExport: true,
            prioritySupport: true,
            teamFeatures: true,
            aiInsights: true,
            healthReports: true,
        },
        limits: {
            maxNotificationsPerDay: 100,
            maxDataRetentionDays: 365,
            maxTeamMembers: 5,
            maxCustomGoals: 25,
        },
    },
];
class UserSubscription extends sequelize_1.Model {
}
exports.UserSubscription = UserSubscription;
UserSubscription.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id',
        },
    },
    planId: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    status: {
        type: sequelize_1.DataTypes.ENUM('active', 'canceled', 'expired'),
        allowNull: false,
        defaultValue: 'active',
    },
    startDate: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
    endDate: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
    },
    stripeSubscriptionId: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
    stripeCustomerId: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: true,
    },
}, {
    sequelize: index_1.sequelize,
    tableName: 'user_subscriptions',
});
exports.default = UserSubscription;
