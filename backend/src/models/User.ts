import { Model, DataTypes, Sequelize } from 'sequelize';
import sequelize from '../config/database';
import bcrypt from 'bcryptjs';

export interface IUser {
  id: number;
  email: string;
  password: string;
  username: string;
  healthScore: number;
  level: number;
  experience: number;
  badges: string[];
  subscriptionPlanId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IUserStatistics {
  totalWorkTime: number;
  goodPostureTime: number;
  blinkReminders: number;
  pomodoroSessions: number;
  consecutiveGoodPostureDays: number;
  lastPostureCheck: Date;
}

class User extends Model<IUser> implements IUser {
  public id!: number;
  public email!: string;
  public password!: string;
  public username!: string;
  public healthScore!: number;
  public level!: number;
  public experience!: number;
  public badges!: string[];
  public subscriptionPlanId?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Метод для проверки пароля
  public async comparePassword(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
  }

  // Метод для хеширования пароля
  public static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 12);
  }
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    healthScore: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    level: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    experience: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    badges: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
      defaultValue: [],
    },
    subscriptionPlanId: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: 'free',
    },
  } as any,
  {
    sequelize,
    tableName: 'users',
    timestamps: true,
  }
);

export default User;
