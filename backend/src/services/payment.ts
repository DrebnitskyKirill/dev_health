import { UserSubscription, SUBSCRIPTION_PLANS } from '../models';

export interface PaymentMethod {
  id: string;
  name: string;
  type: 'card' | 'sbp' | 'yoomoney' | 'crypto';
  supportedCountries: string[];
  fees: {
    percentage: number;
    fixed: number;
  };
}

export interface PaymentRequest {
  userId: number;
  planId: string;
  amount: number;
  currency: string;
  country: string;
  paymentMethod: string;
}

export interface PaymentResponse {
  success: boolean;
  paymentId?: string;
  redirectUrl?: string;
  error?: string;
}

export class PaymentService {
  // Supported payment methods
  private static readonly PAYMENT_METHODS: PaymentMethod[] = [
    {
      id: 'card',
      name: 'Bank Card',
      type: 'card',
      supportedCountries: ['RU', 'US', 'EU', 'GB', 'CA', 'AU'],
      fees: { percentage: 2.9, fixed: 0.30 }
    },
    {
      id: 'sbp',
      name: 'SBP (Fast Payment System)',
      type: 'sbp',
      supportedCountries: ['RU'],
      fees: { percentage: 0.5, fixed: 0 }
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

  // Get available payment methods for country
  static getAvailablePaymentMethods(country: string): PaymentMethod[] {
    return this.PAYMENT_METHODS.filter(method => 
      method.supportedCountries.includes(country) || 
      method.supportedCountries.includes('*')
    );
  }

  // Create payment
  static async createPayment(paymentRequest: PaymentRequest): Promise<PaymentResponse> {
    try {
      const { userId, planId, amount, currency, country, paymentMethod } = paymentRequest;
      
      // Check subscription plan
      const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
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
        case 'sbp':
          return await this.createSBPPayment(userId, planId, totalAmount, currency);
        case 'yoomoney':
          return await this.createYooMoneyPayment(userId, planId, totalAmount, currency);
        case 'card':
          return await this.createCardPayment(userId, planId, totalAmount, currency, country);
        case 'crypto':
          return await this.createCryptoPayment(userId, planId, totalAmount, currency);
        default:
          return { success: false, error: 'Unsupported payment method' };
      }
    } catch (error) {
      console.error('Payment creation error:', error);
      return { success: false, error: 'Payment creation failed' };
    }
  }

  // SBP payment
  private static async createSBPPayment(
    userId: number, 
    planId: string, 
    amount: number, 
    currency: string
  ): Promise<PaymentResponse> {
    try {
      // Here will be SBP API integration
      // Currently simulating payment creation
      const paymentId = `sbp_${Date.now()}_${userId}`;
      
      // In real project here will be SBP API call
      console.log(`Creating SBP payment: ${paymentId} for user ${userId}, amount: ${amount} ${currency}`);
      
      return {
        success: true,
        paymentId,
        redirectUrl: `/payment/sbp/${paymentId}`
      };
    } catch (error) {
      console.error('SBP payment error:', error);
      return { success: false, error: 'SBP payment failed' };
    }
  }

  // YooMoney payment
  private static async createYooMoneyPayment(
    userId: number, 
    planId: string, 
    amount: number, 
    currency: string
  ): Promise<PaymentResponse> {
    try {
      // Here will be YooMoney API integration
      const paymentId = `yoomoney_${Date.now()}_${userId}`;
      
      console.log(`Creating YooMoney payment: ${paymentId} for user ${userId}, amount: ${amount} ${currency}`);
      
      return {
        success: true,
        paymentId,
        redirectUrl: `/payment/yoomoney/${paymentId}`
      };
    } catch (error) {
      console.error('YooMoney payment error:', error);
      return { success: false, error: 'YooMoney payment failed' };
    }
  }

  // Bank card
  private static async createCardPayment(
    userId: number, 
    planId: string, 
    amount: number, 
    currency: string,
    country: string
  ): Promise<PaymentResponse> {
    try {
      // For Russia use YooKassa, for other countries - Stripe
      if (country === 'RU') {
        return await this.createYooKassaPayment(userId, planId, amount, currency);
      } else {
        return await this.createStripePayment(userId, planId, amount, currency);
      }
    } catch (error) {
      console.error('Card payment error:', error);
      return { success: false, error: 'Card payment failed' };
    }
  }

  // YooKassa (for Russia)
  private static async createYooKassaPayment(
    userId: number, 
    planId: string, 
    amount: number, 
    currency: string
  ): Promise<PaymentResponse> {
    try {
      const paymentId = `yookassa_${Date.now()}_${userId}`;
      
      console.log(`Creating YooKassa payment: ${paymentId} for user ${userId}, amount: ${amount} ${currency}`);
      
      return {
        success: true,
        paymentId,
        redirectUrl: `/payment/yookassa/${paymentId}`
      };
    } catch (error) {
      console.error('YooKassa payment error:', error);
      return { success: false, error: 'YooKassa payment failed' };
    }
  }

  // Stripe (for international payments)
  private static async createStripePayment(
    userId: number, 
    planId: string, 
    amount: number, 
    currency: string
  ): Promise<PaymentResponse> {
    try {
      const paymentId = `stripe_${Date.now()}_${userId}`;
      
      console.log(`Creating Stripe payment: ${paymentId} for user ${userId}, amount: ${amount} ${currency}`);
      
      return {
        success: true,
        paymentId,
        redirectUrl: `/payment/stripe/${paymentId}`
      };
    } catch (error) {
      console.error('Stripe payment error:', error);
      return { success: false, error: 'Stripe payment failed' };
    }
  }

  // Cryptocurrency
  private static async createCryptoPayment(
    userId: number, 
    planId: string, 
    amount: number, 
    currency: string
  ): Promise<PaymentResponse> {
    try {
      const paymentId = `crypto_${Date.now()}_${userId}`;
      
      console.log(`Creating crypto payment: ${paymentId} for user ${userId}, amount: ${amount} ${currency}`);
      
      return {
        success: true,
        paymentId,
        redirectUrl: `/payment/crypto/${paymentId}`
      };
    } catch (error) {
      console.error('Crypto payment error:', error);
      return { success: false, error: 'Crypto payment failed' };
    }
  }

  // Confirm payment
  static async confirmPayment(paymentId: string): Promise<boolean> {
    try {
      // In real project here will be payment status check
      console.log(`Confirming payment: ${paymentId}`);
      return true;
    } catch (error) {
      console.error('Payment confirmation error:', error);
      return false;
    }
  }

  // Get payment info
  static async getPaymentInfo(paymentId: string): Promise<any> {
    try {
      // In real project here will be payment info retrieval
      return {
        id: paymentId,
        status: 'pending',
        amount: 0,
        currency: 'USD',
        createdAt: new Date()
      };
    } catch (error) {
      console.error('Get payment info error:', error);
      return null;
    }
  }
}
