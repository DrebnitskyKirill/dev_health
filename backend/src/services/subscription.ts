import { UserSubscription, SUBSCRIPTION_PLANS, User } from '../models';

export class SubscriptionService {
  // Получает текущий план подписки пользователя
  static async getUserPlan(userId: number): Promise<string> {
    try {
      const subscription = await UserSubscription.findOne({
        where: {
          userId,
          status: 'active',
        },
      });
      
      return subscription?.planId || 'free';
    } catch (error) {
      console.error('Error getting user plan:', error);
      return 'free';
    }
  }

  // Проверяет, есть ли у пользователя определенная функция
  static hasFeature(userPlanId: string, feature: keyof typeof SUBSCRIPTION_PLANS[0]['features']): boolean {
    const plan = SUBSCRIPTION_PLANS.find(p => p.id === userPlanId);
    return plan ? plan.features[feature] : false;
  }

  // Получает лимиты плана пользователя
  static getPlanLimits(userPlanId: string) {
    const plan = SUBSCRIPTION_PLANS.find(p => p.id === userPlanId);
    return plan ? plan.limits : SUBSCRIPTION_PLANS[0].limits;
  }

  // Создает новую подписку
  static async createSubscription(
    userId: number,
    planId: string,
    stripeSubscriptionId?: string,
    stripeCustomerId?: string
  ): Promise<UserSubscription> {
    const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
    if (!plan) {
      throw new Error('Invalid subscription plan');
    }

    // Отменяем текущую активную подписку
    await UserSubscription.update(
      { status: 'canceled' },
      {
        where: {
          userId,
          status: 'active',
        },
      }
    );

    // Создаем новую подписку
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1); // +1 месяц

    const subscription = await UserSubscription.create({
      userId,
      planId,
      status: 'active',
      startDate,
      endDate,
      stripeSubscriptionId,
      stripeCustomerId,
    });

    // Обновляем план пользователя
    await User.update(
      { subscriptionPlanId: planId },
      { where: { id: userId } }
    );

    return subscription;
  }

  // Отменяет подписку
  static async cancelSubscription(userId: number): Promise<void> {
    await UserSubscription.update(
      { status: 'canceled' },
      {
        where: {
          userId,
          status: 'active',
        },
      }
    );

    // Возвращаем пользователя на бесплатный план
    await User.update(
      { subscriptionPlanId: 'free' },
      { where: { id: userId } }
    );
  }

  // Проверяет, не истекла ли подписка
  static async checkExpiredSubscriptions(): Promise<void> {
    const expiredSubscriptions = await UserSubscription.findAll({
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
    const stats = await UserSubscription.findAll({
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
