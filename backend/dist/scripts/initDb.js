"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const sequelize_1 = require("sequelize");
const models_1 = require("../models");
const defaultAchievements_1 = require("../models/defaultAchievements");
dotenv_1.default.config();
async function initializeDatabase() {
    try {
        console.log('Connecting to PostgreSQL...');
        // Сначала подключаемся к базе данных postgres (которая всегда существует)
        const tempSequelize = new sequelize_1.Sequelize('postgres', process.env.DB_USER || 'postgres', process.env.DB_PASSWORD || 'password', {
            host: process.env.DB_HOST || 'localhost',
            port: parseInt(process.env.DB_PORT || '5432'),
            dialect: 'postgres',
            logging: false,
        });
        // Проверяем подключение
        await tempSequelize.authenticate();
        console.log('Connected to PostgreSQL server');
        // Создаем базу данных, если она не существует
        const dbName = process.env.DB_NAME || 'dev_health';
        try {
            await tempSequelize.query(`CREATE DATABASE "${dbName}";`);
            console.log(`Database "${dbName}" created successfully`);
        }
        catch (error) {
            // Проверяем код ошибки PostgreSQL (42P04 = duplicate_database)
            if (error.parent?.code === '42P04' ||
                error.original?.code === '42P04' ||
                error.message.includes('already exists') ||
                error.parent?.message?.includes('already exists') ||
                error.original?.message?.includes('already exists')) {
                console.log(`Database "${dbName}" already exists`);
            }
            else {
                throw error;
            }
        }
        // Закрываем временное подключение
        await tempSequelize.close();
        // Подключаемся к созданной базе данных
        const { sequelize } = await Promise.resolve().then(() => __importStar(require('../models')));
        await sequelize.authenticate();
        console.log(`Connected to database "${dbName}"`);
        console.log('Synchronizing database...');
        await sequelize.sync({ force: true }); // force: true удалит все таблицы и создаст заново
        console.log('Database synchronized');
        console.log('Initializing default achievements...');
        await models_1.Achievement.bulkCreate(defaultAchievements_1.defaultAchievements);
        console.log(`Created ${defaultAchievements_1.defaultAchievements.length} default achievements`);
        console.log('Database initialization completed successfully!');
        process.exit(0);
    }
    catch (error) {
        console.error('Database initialization failed:', error);
        process.exit(1);
    }
}
initializeDatabase();
