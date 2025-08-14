import { Model, DataTypes, Sequelize } from 'sequelize';
import { sequelize } from './index';

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: 'month' | 'year';
  features: {
    basicMonitoring: boolean;
    advancedAnalytics: boolean;
    integrations: boolean;
    gamification: boolean;
    customNotifications: boolean;
    dataExport: boolean;
    prioritySupport: boolean;
    teamFeatures: boolean;
    aiInsights: boolean;
    healthReports: boolean;
  };
  limits: {
    maxNotificationsPerDay: number;
    maxDataRetentionDays: number;
    maxTeamMembers: number;
    maxCustomGoals: number;
  };
}

export const SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
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

export class UserSubscription extends Model {
  public id!: number;
  public userId!: number;
  public planId!: string;
  public status!: 'active' | 'canceled' | 'expired';
  public startDate!: Date;
  public endDate!: Date;
  public stripeSubscriptionId?: string;
  public stripeCustomerId?: string;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

UserSubscription.init(
  {
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
    planId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('active', 'canceled', 'expired'),
      allowNull: false,
      defaultValue: 'active',
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    endDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    stripeSubscriptionId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    stripeCustomerId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'user_subscriptions',
  }
);

export default UserSubscription;
