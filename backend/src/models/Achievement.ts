import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

export interface IAchievement {
  id: number;
  name: string;
  description: string;
  type: 'posture' | 'blink' | 'pomodoro' | 'streak' | 'time';
  icon: string;
  points: number;
  requirements: {
    [key: string]: number;
  };
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  createdAt: Date;
  updatedAt: Date;
}

class Achievement extends Model<IAchievement> implements IAchievement {
  public id!: number;
  public name!: string;
  public description!: string;
  public type!: 'posture' | 'blink' | 'pomodoro' | 'streak' | 'time';
  public icon!: string;
  public points!: number;
  public requirements!: { [key: string]: number };
  public rarity!: 'common' | 'rare' | 'epic' | 'legendary';
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Achievement.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    type: {
      type: DataTypes.ENUM('posture', 'blink', 'pomodoro', 'streak', 'time'),
      allowNull: false,
    },
    icon: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    points: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    requirements: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {},
    },
    rarity: {
      type: DataTypes.ENUM('common', 'rare', 'epic', 'legendary'),
      allowNull: false,
      defaultValue: 'common',
    },
  } as any,
  {
    sequelize,
    tableName: 'achievements',
    timestamps: true,
  }
);

// Связь многие-ко-многим между User и Achievement
export const UserAchievement = sequelize.define('UserAchievement', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  achievementId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'achievements',
      key: 'id',
    },
  },
  earnedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW,
  },
}, {
  tableName: 'user_achievements',
  timestamps: true,
});

// Модель для статистики пользователя
export const UserStatistics = sequelize.define('UserStatistics', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: 'users',
      key: 'id',
    },
  },
  totalWorkTime: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  goodPostureTime: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  blinkReminders: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  pomodoroSessions: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  consecutiveGoodPostureDays: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  lastPostureCheck: {
    type: DataTypes.DATE,
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

export default Achievement;
