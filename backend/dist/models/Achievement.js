"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserStatistics = exports.UserAchievement = void 0;
const sequelize_1 = require("sequelize");
const database_1 = __importDefault(require("../config/database"));
class Achievement extends sequelize_1.Model {
}
Achievement.init({
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    name: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: sequelize_1.DataTypes.TEXT,
        allowNull: false,
    },
    type: {
        type: sequelize_1.DataTypes.ENUM('posture', 'blink', 'pomodoro', 'streak', 'time'),
        allowNull: false,
    },
    icon: {
        type: sequelize_1.DataTypes.STRING,
        allowNull: false,
    },
    points: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    requirements: {
        type: sequelize_1.DataTypes.JSONB,
        allowNull: false,
        defaultValue: {},
    },
    rarity: {
        type: sequelize_1.DataTypes.ENUM('common', 'rare', 'epic', 'legendary'),
        allowNull: false,
        defaultValue: 'common',
    },
}, {
    sequelize: database_1.default,
    tableName: 'achievements',
    timestamps: true,
});
// Связь многие-ко-многим между User и Achievement
exports.UserAchievement = database_1.default.define('UserAchievement', {
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
    achievementId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'achievements',
            key: 'id',
        },
    },
    earnedAt: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize_1.DataTypes.NOW,
    },
}, {
    tableName: 'user_achievements',
    timestamps: true,
});
// Модель для статистики пользователя
exports.UserStatistics = database_1.default.define('UserStatistics', {
    id: {
        type: sequelize_1.DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    userId: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        unique: true,
        references: {
            model: 'users',
            key: 'id',
        },
    },
    totalWorkTime: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    goodPostureTime: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    blinkReminders: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    pomodoroSessions: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    consecutiveGoodPostureDays: {
        type: sequelize_1.DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
    },
    lastPostureCheck: {
        type: sequelize_1.DataTypes.DATE,
        allowNull: true,
    },
}, {
    tableName: 'user_statistics',
    timestamps: true,
});
// Определяем связи
// Assuming User model is defined elsewhere or needs to be imported
// import User from './User'; // Example if User model is in the same file
// User.hasMany(UserAchievement, { foreignKey: 'userId' });
// UserAchievement.belongsTo(User, { foreignKey: 'userId' });
// Achievement.hasMany(UserAchievement, { foreignKey: 'achievementId' });
// UserAchievement.belongsTo(Achievement, { foreignKey: 'achievementId' });
// User.hasOne(UserStatistics, { foreignKey: 'userId' });
// UserStatistics.belongsTo(User, { foreignKey: 'userId' });
exports.default = Achievement;
