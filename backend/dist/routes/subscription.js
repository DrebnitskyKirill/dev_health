"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const subscription_1 = require("../services/subscription");
const subscription_2 = require("../middleware/subscription");
const models_1 = require("../models");
const payment_1 = require("../services/payment");
const router = (0, express_1.Router)();
// Получить доступные планы подписки
router.get("/plans", (req, res) => {
    res.json({
        plans: models_1.SUBSCRIPTION_PLANS.map((plan) => ({
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
router.get("/current", subscription_2.authAndSubscription, async (req, res) => {
    try {
        const planId = req.user.subscriptionPlanId || "free";
        const plan = models_1.SUBSCRIPTION_PLANS.find((p) => p.id === planId);
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
    }
    catch (error) {
        console.error("Error getting current plan:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
// Создать подписку (симуляция - в реальном проекте здесь будет Stripe)
router.post("/subscribe", subscription_2.authAndSubscription, async (req, res) => {
    try {
        const { planId } = req.body;
        if (!planId || !models_1.SUBSCRIPTION_PLANS.find((p) => p.id === planId)) {
            return res.status(400).json({ message: "Invalid plan ID" });
        }
        // В реальном проекте здесь будет интеграция со Stripe
        // Сейчас просто создаем подписку
        const subscription = await subscription_1.SubscriptionService.createSubscription(req.user.id, planId);
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
    }
    catch (error) {
        console.error("Error creating subscription:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
// Payment: get available methods for country
router.get("/payment/methods", (req, res) => {
    const country = req.query.country || "RU";
    const methods = payment_1.PaymentService.getAvailablePaymentMethods(country);
    res.json({ methods });
});
// Payment: create payment intent (simulation / provider abstraction)
router.post("/payment/create", subscription_2.authAndSubscription, async (req, res) => {
    try {
        const { planId, paymentMethod, currency = "USD", country = "RU" } = req.body || {};
        const plan = models_1.SUBSCRIPTION_PLANS.find((p) => p.id === planId);
        if (!plan) {
            return res.status(400).json({ message: "Invalid plan ID" });
        }
        if (plan.price <= 0) {
            return res.status(400).json({ message: "Selected plan does not require payment" });
        }
        const payment = await payment_1.PaymentService.createPayment({
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
        res.json({
            message: "Payment created",
            payment,
        });
    }
    catch (error) {
        console.error("Error creating payment:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
// Payment: webhook/return URL to confirm and activate subscription
router.post('/payment/webhook', async (req, res) => {
    try {
        const { paymentId, planId, userId } = (req.body || {});
        if (!paymentId || !planId || !userId)
            return res.status(400).json({ message: 'Invalid payload' });
        const ok = await payment_1.PaymentService.confirmPayment(paymentId);
        if (!ok)
            return res.status(400).json({ message: 'Payment not confirmed' });
        const subscription = await subscription_1.SubscriptionService.createSubscription(Number(userId), String(planId));
        res.json({ message: 'Subscription activated', subscription: {
                id: subscription.id,
                planId: subscription.planId,
                status: subscription.status,
                startDate: subscription.startDate,
                endDate: subscription.endDate,
            } });
    }
    catch (e) {
        console.error('Webhook error', e);
        res.status(500).json({ message: 'Internal server error' });
    }
});
// Отменить подписку
router.post("/cancel", subscription_2.authAndSubscription, async (req, res) => {
    try {
        await subscription_1.SubscriptionService.cancelSubscription(req.user.id);
        res.json({ message: "Subscription canceled successfully" });
    }
    catch (error) {
        console.error("Error canceling subscription:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
// Получить расширенную аналитику (требует premium)
router.get("/analytics", subscription_2.authAndSubscription, (0, subscription_2.requireFeature)("advancedAnalytics"), async (req, res) => {
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
    }
    catch (error) {
        console.error("Error getting analytics:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
// Получить интеграции (требует premium)
router.get("/integrations", subscription_2.authAndSubscription, (0, subscription_2.requireFeature)("integrations"), async (req, res) => {
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
    }
    catch (error) {
        console.error("Error getting integrations:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
// Получить AI инсайты (требует pro)
router.get("/ai-insights", subscription_2.authAndSubscription, (0, subscription_2.requireFeature)("aiInsights"), async (req, res) => {
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
    }
    catch (error) {
        console.error("Error getting AI insights:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});
exports.default = router;
