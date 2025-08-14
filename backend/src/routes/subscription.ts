import { Router, Response, Request } from "express";
import { SubscriptionService } from "../services/subscription";
import {
  authAndSubscription,
  requireFeature,
} from "../middleware/subscription";
import { SUBSCRIPTION_PLANS } from "../models";
import { PaymentService } from "../services/payment";

const router = Router();

// Получить доступные планы подписки
router.get("/plans", (req, res) => {
  res.json({
    plans: SUBSCRIPTION_PLANS.map((plan) => ({
      id: plan.id,
      name: plan.name,
      price: plan.price,
      currency: plan.currency,
      interval: plan.interval,
      features: plan.features,
      limits: plan.limits,
    })),
  });
});

// Получить текущий план пользователя
router.get("/current", authAndSubscription, async (req: any, res: Response) => {
  try {
    const planId = req.user.subscriptionPlanId || "free";
    const plan = SUBSCRIPTION_PLANS.find((p) => p.id === planId);

    if (!plan) {
      return res.status(404).json({ message: "Plan not found" });
    }

    res.json({
      plan: {
        id: plan.id,
        name: plan.name,
        price: plan.price,
        currency: plan.currency,
        interval: plan.interval,
        features: plan.features,
        limits: plan.limits,
      },
    });
  } catch (error) {
    console.error("Error getting current plan:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Создать подписку (симуляция - в реальном проекте здесь будет Stripe)
router.post(
  "/subscribe",
  authAndSubscription,
  async (req: any, res: Response) => {
    try {
      const { planId } = req.body;

      if (!planId || !SUBSCRIPTION_PLANS.find((p) => p.id === planId)) {
        return res.status(400).json({ message: "Invalid plan ID" });
      }

      // В реальном проекте здесь будет интеграция со Stripe
      // Сейчас просто создаем подписку
      const subscription = await SubscriptionService.createSubscription(
        req.user.id,
        planId
      );

      res.json({
        message: "Subscription created successfully",
        subscription: {
          id: subscription.id,
          planId: subscription.planId,
          status: subscription.status,
          startDate: subscription.startDate,
          endDate: subscription.endDate,
        },
      });
    } catch (error) {
      console.error("Error creating subscription:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Payment: get available methods for country
router.get(
  "/payment/methods",
  (req: Request, res: Response) => {
    const country = (req.query.country as string) || "RU";
    const methods = PaymentService.getAvailablePaymentMethods(country);
    res.json({ methods });
  }
);

// Payment: create payment intent (simulation / provider abstraction)
router.post(
  "/payment/create",
  authAndSubscription,
  async (req: any, res: Response) => {
    try {
      const { planId, paymentMethod, currency = "USD", country = "RU" } = req.body || {};

      const plan = SUBSCRIPTION_PLANS.find((p) => p.id === planId);
      if (!plan) {
        return res.status(400).json({ message: "Invalid plan ID" });
      }
      if (plan.price <= 0) {
        return res.status(400).json({ message: "Selected plan does not require payment" });
      }

      const payment = await PaymentService.createPayment({
        userId: req.user.id,
        planId,
        amount: plan.price,
        currency,
        country,
        paymentMethod,
      });

      if (!payment.success) {
        return res.status(400).json({ message: payment.error || "Payment failed" });
      }

      // In a real flow you'd redirect to payment.redirectUrl
      // For now, immediately confirm and activate subscription
      const confirmed = await PaymentService.confirmPayment(payment.paymentId!);
      if (!confirmed) {
        return res.status(400).json({ message: "Payment confirmation failed" });
      }

      const subscription = await SubscriptionService.createSubscription(req.user.id, planId);

      res.json({
        message: "Payment successful and subscription activated",
        payment,
        subscription: {
          id: subscription.id,
          planId: subscription.planId,
          status: subscription.status,
          startDate: subscription.startDate,
          endDate: subscription.endDate,
        },
      });
    } catch (error) {
      console.error("Error creating payment:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Отменить подписку
router.post("/cancel", authAndSubscription, async (req: any, res: Response) => {
  try {
    await SubscriptionService.cancelSubscription(req.user.id);

    res.json({ message: "Subscription canceled successfully" });
  } catch (error) {
    console.error("Error canceling subscription:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Получить расширенную аналитику (требует premium)
router.get(
  "/analytics",
  authAndSubscription,
  requireFeature("advancedAnalytics"),
  async (req: any, res: Response) => {
    try {
      // Здесь будет логика получения расширенной аналитики
      res.json({
        message: "Advanced analytics available",
        data: {
          weeklyTrends: [],
          monthlyReports: [],
          healthInsights: [],
        },
      });
    } catch (error) {
      console.error("Error getting analytics:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Получить интеграции (требует premium)
router.get(
  "/integrations",
  authAndSubscription,
  requireFeature("integrations"),
  async (req: any, res: Response) => {
    try {
      res.json({
        message: "Integrations available",
        integrations: [
          { name: "Slack", status: "available" },
          { name: "Discord", status: "available" },
          { name: "Email", status: "available" },
          { name: "Calendar", status: "available" },
        ],
      });
    } catch (error) {
      console.error("Error getting integrations:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Получить AI инсайты (требует pro)
router.get(
  "/ai-insights",
  authAndSubscription,
  requireFeature("aiInsights"),
  async (req: any, res: Response) => {
    try {
      res.json({
        message: "AI insights available",
        insights: [
          {
            type: "posture",
            recommendation: "Your posture has improved 15% this week",
          },
          { type: "productivity", recommendation: "Best work time: 9-11 AM" },
          {
            type: "health",
            recommendation: "Consider taking more breaks during long sessions",
          },
        ],
      });
    } catch (error) {
      console.error("Error getting AI insights:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

export default router;
