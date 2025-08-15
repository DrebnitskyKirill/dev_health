"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
const models_1 = require("../models");
class PaymentService {
    // Get available payment methods for country
    static getAvailablePaymentMethods(country) {
        return this.PAYMENT_METHODS.filter(method => method.supportedCountries.includes(country) ||
            method.supportedCountries.includes('*'));
    }
    // Create payment
    static async createPayment(paymentRequest) {
        try {
            const { userId, planId, amount, currency, country, paymentMethod } = paymentRequest;
            // Check subscription plan
            const plan = models_1.SUBSCRIPTION_PLANS.find(p => p.id === planId);
            if (!plan) {
                return { success: false, error: 'Invalid subscription plan' };
            }
            // Check payment method
            const method = this.PAYMENT_METHODS.find(m => m.id === paymentMethod);
            if (!method || !method.supportedCountries.includes(country)) {
                return { success: false, error: 'Payment method not supported in this country' };
            }
            // Calculate fee
            const fee = (amount * method.fees.percentage / 100) + method.fees.fixed;
            const totalAmount = amount + fee;
            // Create payment based on method
            switch (paymentMethod) {
                case 'qiwi':
                    return await this.createQiwiPayment(userId, planId, totalAmount, currency);
                case 'yoomoney':
                    return await this.createYooMoneyPayment(userId, planId, totalAmount, currency);
                case 'crypto':
                    return await this.createCryptoPayment(userId, planId, totalAmount, currency);
                default:
                    return { success: false, error: 'Unsupported payment method' };
            }
        }
        catch (error) {
            console.error('Payment creation error:', error);
            return { success: false, error: 'Payment creation failed' };
        }
    }
    // QIWI Wallet payment (link to wallet top-up form)
    static async createQiwiPayment(userId, planId, amount, currency) {
        try {
            const paymentId = `qiwi_${Date.now()}_${userId}`;
            await models_1.Payment.create({
                userId,
                provider: 'qiwi',
                providerPaymentId: paymentId,
                planId,
                amount,
                currency,
                status: 'pending',
                metadata: {
                    account: process.env.QIWI_WALLET || 'set_qiwi_wallet',
                    comment: `DevHealth ${planId}`,
                },
            });
            // QIWI wallet top-up public form (RUB only). Currency 643 = RUB
            const wallet = process.env.QIWI_WALLET || 'set_qiwi_wallet';
            const integer = Math.floor(amount);
            const fraction = Math.round((amount - integer) * 100);
            const qiwiUrl = `https://qiwi.com/payment/form/99?extra['account']=${encodeURIComponent(wallet)}&amountInteger=${integer}&amountFraction=${fraction}&currency=643&extra['comment']=${encodeURIComponent('DevHealth ' + planId)}`;
            return { success: true, paymentId, redirectUrl: qiwiUrl };
        }
        catch (error) {
            console.error('QIWI payment error:', error);
            return { success: false, error: 'QIWI payment failed' };
        }
    }
    // YooMoney payment
    static async createYooMoneyPayment(userId, planId, amount, currency) {
        try {
            const paymentId = `yoomoney_${Date.now()}_${userId}`;
            await models_1.Payment.create({
                userId,
                provider: 'yoomoney',
                providerPaymentId: paymentId,
                planId,
                amount,
                currency,
                status: 'pending',
            });
            const receiver = process.env.YOOMONEY_WALLET || 'set_wallet';
            const successUrl = process.env.PAYMENT_SUCCESS_URL || 'http://localhost:3000/subscription?success=1';
            const quickpay = `https://yoomoney.ru/quickpay/confirm.xml?receiver=${encodeURIComponent(receiver)}&quickpay-form=shop&targets=${encodeURIComponent('DevHealth ' + planId)}&paymentType=SB&sum=${amount}&successURL=${encodeURIComponent(successUrl)}`;
            return { success: true, paymentId, redirectUrl: quickpay };
        }
        catch (error) {
            console.error('YooMoney payment error:', error);
            return { success: false, error: 'YooMoney payment failed' };
        }
    }
    // Removed card/YooKassa/Stripe flows per requirements
    // Cryptocurrency
    static async createCryptoPayment(userId, planId, amount, currency) {
        try {
            const paymentId = `crypto_${Date.now()}_${userId}`;
            await models_1.Payment.create({
                userId,
                provider: 'crypto',
                providerPaymentId: paymentId,
                planId,
                amount,
                currency,
                status: 'pending',
                metadata: {
                    usdt_trc20: process.env.CRYPTO_USDT_TRC20 || 'set_usdt_trc20',
                    btc: process.env.CRYPTO_BTC || 'set_btc',
                    eth: process.env.CRYPTO_ETH || 'set_eth',
                    memo: `DevHealth ${planId}`,
                }
            });
            const redirectUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/subscription?crypto=1`;
            return { success: true, paymentId, redirectUrl };
        }
        catch (error) {
            console.error('Crypto payment error:', error);
            return { success: false, error: 'Crypto payment failed' };
        }
    }
    // Confirm payment
    static async confirmPayment(paymentId) {
        try {
            const payment = await models_1.Payment.findOne({ where: { providerPaymentId: paymentId } });
            if (!payment)
                return false;
            await payment.update({ status: 'succeeded' });
            return true;
        }
        catch (error) {
            console.error('Payment confirmation error:', error);
            return false;
        }
    }
    // Get payment info
    static async getPaymentInfo(paymentId) {
        try {
            // In real project here will be payment info retrieval
            return {
                id: paymentId,
                status: 'pending',
                amount: 0,
                currency: 'USD',
                createdAt: new Date()
            };
        }
        catch (error) {
            console.error('Get payment info error:', error);
            return null;
        }
    }
}
exports.PaymentService = PaymentService;
// Supported payment methods
PaymentService.PAYMENT_METHODS = [
    {
        id: 'qiwi',
        name: 'QIWI Wallet',
        type: 'card',
        supportedCountries: ['RU'],
        fees: { percentage: 1.0, fixed: 0 }
    },
    {
        id: 'yoomoney',
        name: 'YooMoney',
        type: 'yoomoney',
        supportedCountries: ['RU'],
        fees: { percentage: 2.8, fixed: 0 }
    },
    {
        id: 'crypto',
        name: 'Cryptocurrency',
        type: 'crypto',
        supportedCountries: ['RU', 'US', 'EU', 'GB', 'CA', 'AU'],
        fees: { percentage: 1.0, fixed: 0 }
    }
];
