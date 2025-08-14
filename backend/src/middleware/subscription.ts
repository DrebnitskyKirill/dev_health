import { Request, Response, NextFunction } from 'express';
import { UserSubscription, SUBSCRIPTION_PLANS } from '../models';
import { authenticateToken } from './auth';

export interface SubscriptionRequest extends Request {
  user?: any;
}

// Проверяет, есть ли у пользователя активная подписка
export const checkSubscription = async (
  req: SubscriptionRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const currentUserId = (req as any).user?.userId || (req as any).user?.id;
    if (!currentUserId) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const subscription = await UserSubscription.findOne({
      where: {
        userId: currentUserId,
        status: 'active',
      },
    });

    if (subscription) {
      req.user.subscriptionPlanId = subscription.planId;
    } else {
      req.user.subscriptionPlanId = 'free';
    }

    next();
  } catch (error) {
    console.error('Subscription check error:', error);
    if ((req as any).user) (req as any).user.subscriptionPlanId = 'free';
    next();
  }
};

// Проверяет, есть ли у пользователя определенная функция
export const requireFeature = (feature: keyof typeof SUBSCRIPTION_PLANS[0]['features']) => {
  return (req: SubscriptionRequest, res: Response, next: NextFunction) => {
    const planId = req.user?.subscriptionPlanId || 'free';
    const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
    
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

// Проверяет лимиты подписки
export const checkLimit = (limitType: keyof typeof SUBSCRIPTION_PLANS[0]['limits']) => {
  return (req: SubscriptionRequest, res: Response, next: NextFunction) => {
    const planId = req.user?.subscriptionPlanId || 'free';
    const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
    
    if (!plan) {
      return res.status(400).json({ message: 'Invalid subscription plan' });
    }
    
    // Здесь можно добавить логику проверки текущего использования
    // Например, количество уведомлений за день
    
    next();
  };
};

// Middleware для проверки подписки с аутентификацией
export const authAndSubscription = [authenticateToken, checkSubscription];
