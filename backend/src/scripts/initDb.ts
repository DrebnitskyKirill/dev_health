import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';
import { Achievement } from '../models';
import { defaultAchievements } from '../models/defaultAchievements';

dotenv.config();

async function initializeDatabase() {
  try {
    console.log('Connecting to PostgreSQL...');
    
    // Сначала подключаемся к базе данных postgres (которая всегда существует)
    const tempSequelize = new Sequelize(
      'postgres',
      process.env.DB_USER || 'postgres',
      process.env.DB_PASSWORD || 'password',
      {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        dialect: 'postgres',
        logging: false,
      }
    );

    // Проверяем подключение
    await tempSequelize.authenticate();
    console.log('Connected to PostgreSQL server');

    // Создаем базу данных, если она не существует
    const dbName = process.env.DB_NAME || 'dev_health';
    try {
      await tempSequelize.query(`CREATE DATABASE "${dbName}";`);
      console.log(`Database "${dbName}" created successfully`);
    } catch (error: any) {
      // Проверяем код ошибки PostgreSQL (42P04 = duplicate_database)
      if (error.parent?.code === '42P04' || 
          error.original?.code === '42P04' ||
          error.message.includes('already exists') || 
          error.parent?.message?.includes('already exists') ||
          error.original?.message?.includes('already exists')) {
        console.log(`Database "${dbName}" already exists`);
      } else {
        throw error;
      }
    }

    // Закрываем временное подключение
    await tempSequelize.close();

    // Подключаемся к созданной базе данных
    const { sequelize } = await import('../models');
    await sequelize.authenticate();
    console.log(`Connected to database "${dbName}"`);

    console.log('Synchronizing database...');
    await sequelize.sync({ force: true }); // force: true удалит все таблицы и создаст заново
    console.log('Database synchronized');

    console.log('Initializing default achievements...');
    await Achievement.bulkCreate(defaultAchievements as any);
    console.log(`Created ${defaultAchievements.length} default achievements`);

    console.log('Database initialization completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Database initialization failed:', error);
    process.exit(1);
  }
}

initializeDatabase();
