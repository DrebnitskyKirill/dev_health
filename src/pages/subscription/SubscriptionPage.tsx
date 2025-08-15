import React, { useState, useEffect } from "react";
import { Card } from "../../shared/ui/Card";
import { useAuth } from "../../shared/context/AuthContext";
import { useLanguage } from "../../shared/context/LanguageContext";
import { API_BASE_URL } from "../../shared/config";

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: "month" | "year";
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

const SubscriptionPage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const { t } = useLanguage();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [currentPlan, setCurrentPlan] = useState<SubscriptionPlan | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(
    null
  );
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] =
    useState<string>("sbp");
  const [userCountry, setUserCountry] = useState("RU");

  useEffect(() => {
    fetchPlans();
    fetchCurrentPlan();
    detectUserCountry();
  }, []);

  const fetchPlans = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/subscription/plans`
      );
      const data = await response.json();
      setPlans(data.plans);
    } catch (error) {
      console.error("Error fetching plans:", error);
    }
  };

  const detectUserCountry = async () => {
    try {
      // Detect user country by IP
      const response = await fetch("https://ipapi.co/json/");
      const data = await response.json();
      setUserCountry(data.country_code || "RU");
    } catch (error) {
      console.error("Error detecting country:", error);
      setUserCountry("RU"); // Default to Russia
    }
  };

  const fetchCurrentPlan = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(
        `${API_BASE_URL}/subscription/current`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setCurrentPlan(data.plan);
      }
    } catch (error) {
      console.error("Error fetching current plan:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (plan: SubscriptionPlan) => {
    if (plan.id === "free") {
      // Free plan doesn't require payment
      try {
        setSubscribing(true);
        const token = localStorage.getItem("token");

        const response = await fetch(
          `${API_BASE_URL}/subscription/subscribe`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ planId: plan.id }),
          }
        );

        if (response.ok) {
          const data = await response.json();
          setCurrentPlan(data.subscription);

          if (user) {
            updateUser({ ...user, subscriptionPlanId: plan.id });
          }

          alert("Subscription updated successfully!");
        } else {
          const error = await response.json();
          alert(`Error: ${error.message}`);
        }
      } catch (error) {
        console.error("Error subscribing:", error);
        alert("Error updating subscription");
      } finally {
        setSubscribing(false);
      }
    } else {
      // Paid plan - show payment modal
      setSelectedPlan(plan);
      setShowPaymentModal(true);
    }
  };

  const handleCancel = async () => {
    if (!confirm("Are you sure you want to cancel your subscription?")) return;

    try {
      setSubscribing(true);
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_BASE_URL}/subscription/cancel`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        setCurrentPlan(plans.find((p) => p.id === "free") || null);

        if (user) {
          updateUser({ ...user, subscriptionPlanId: "free" });
        }

        alert("Subscription canceled successfully!");
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error("Error canceling subscription:", error);
      alert("Error canceling subscription");
    } finally {
      setSubscribing(false);
    }
  };

  const getFeatureIcon = (enabled: boolean) => {
    return enabled ? "✅" : "❌";
  };

  const getFeatureText = (enabled: boolean) => {
    return enabled ? "text-green-600" : "text-gray-400";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Loading subscription plans...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          {t("subscription.title")}
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          {t("subscription.subtitle")}
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            title={plan.name}
            className={`relative ${
              currentPlan?.id === plan.id
                ? "ring-2 ring-blue-500 bg-blue-50"
                : ""
            }`}
          >
            {currentPlan?.id === plan.id && (
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Current Plan
                </span>
              </div>
            )}

            <div className="text-center mb-6">
              <div className="text-3xl font-bold text-gray-900">
                {plan.price === 0 ? "Free" : `$${plan.price}`}
              </div>
              <div className="text-gray-600">
                {plan.price === 0 ? "Forever" : `per ${plan.interval}`}
              </div>
            </div>

            <div className="space-y-4 mb-6">
              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900">
                  {t("subscription.features")}:
                </h4>
                <div className="space-y-1 text-sm">
                  <div
                    className={`flex items-center gap-2 ${getFeatureText(
                      plan.features.basicMonitoring
                    )}`}
                  >
                    <span>{getFeatureIcon(plan.features.basicMonitoring)}</span>
                    <span>{t("features.basicMonitoring")}</span>
                  </div>
                  <div
                    className={`flex items-center gap-2 ${getFeatureText(
                      plan.features.advancedAnalytics
                    )}`}
                  >
                    <span>
                      {getFeatureIcon(plan.features.advancedAnalytics)}
                    </span>
                    <span>{t("features.advancedAnalytics")}</span>
                  </div>
                  <div
                    className={`flex items-center gap-2 ${getFeatureText(
                      plan.features.integrations
                    )}`}
                  >
                    <span>{getFeatureIcon(plan.features.integrations)}</span>
                    <span>{t("features.integrations")}</span>
                  </div>
                  <div
                    className={`flex items-center gap-2 ${getFeatureText(
                      plan.features.gamification
                    )}`}
                  >
                    <span>{getFeatureIcon(plan.features.gamification)}</span>
                    <span>{t("features.gamification")}</span>
                  </div>
                  <div
                    className={`flex items-center gap-2 ${getFeatureText(
                      plan.features.customNotifications
                    )}`}
                  >
                    <span>
                      {getFeatureIcon(plan.features.customNotifications)}
                    </span>
                    <span>{t("features.customNotifications")}</span>
                  </div>
                  <div
                    className={`flex items-center gap-2 ${getFeatureText(
                      plan.features.dataExport
                    )}`}
                  >
                    <span>{getFeatureIcon(plan.features.dataExport)}</span>
                    <span>{t("features.dataExport")}</span>
                  </div>
                  <div
                    className={`flex items-center gap-2 ${getFeatureText(
                      plan.features.prioritySupport
                    )}`}
                  >
                    <span>{getFeatureIcon(plan.features.prioritySupport)}</span>
                    <span>{t("features.prioritySupport")}</span>
                  </div>
                  <div
                    className={`flex items-center gap-2 ${getFeatureText(
                      plan.features.teamFeatures
                    )}`}
                  >
                    <span>{getFeatureIcon(plan.features.teamFeatures)}</span>
                    <span>{t("features.teamFeatures")}</span>
                  </div>
                  <div
                    className={`flex items-center gap-2 ${getFeatureText(
                      plan.features.aiInsights
                    )}`}
                  >
                    <span>{getFeatureIcon(plan.features.aiInsights)}</span>
                    <span>{t("features.aiInsights")}</span>
                  </div>
                  <div
                    className={`flex items-center gap-2 ${getFeatureText(
                      plan.features.healthReports
                    )}`}
                  >
                    <span>{getFeatureIcon(plan.features.healthReports)}</span>
                    <span>{t("features.healthReports")}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-semibold text-gray-900">
                  {t("subscription.limits")}:
                </h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>
                    {t("subscription.notifications")}:{" "}
                    {plan.limits.maxNotificationsPerDay}/day
                  </div>
                  <div>
                    {t("subscription.dataRetention")}:{" "}
                    {plan.limits.maxDataRetentionDays} days
                  </div>
                  <div>
                    {t("subscription.teamMembers")}:{" "}
                    {plan.limits.maxTeamMembers}
                  </div>
                  <div>
                    {t("subscription.customGoals")}:{" "}
                    {plan.limits.maxCustomGoals}
                  </div>
                </div>
              </div>
            </div>

            {currentPlan?.id !== plan.id && (
              <button
                onClick={() => handleSubscribe(plan)}
                disabled={subscribing}
                className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${
                  plan.id === "free"
                    ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                } disabled:opacity-50`}
              >
                {subscribing
                  ? "Processing..."
                  : plan.id === "free"
                  ? "Current Plan"
                  : t("subscription.subscribeNow")}
              </button>
            )}
          </Card>
        ))}
      </div>

      <div className="text-center text-gray-600">
        <p>
          All plans include a 7-day free trial. Cancel anytime.
          <br />
          Need help? Contact our support team.
        </p>
      </div>

      {/* Модальное окно оплаты */}
      {showPaymentModal && selectedPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-semibold mb-4">
              {t("subscription.payment.title")} - {selectedPlan.name}
            </h3>

            <div className="mb-4">
              <p className="text-gray-600 mb-2">
                {t("subscription.payment.amount")}:
              </p>
              <p className="text-2xl font-bold text-green-600">
                ${selectedPlan.price}
              </p>
            </div>

            <div className="mb-4">
              <p className="text-gray-600 mb-2">
                {t("subscription.payment.method")}:
              </p>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="payment"
                    value="qiwi"
                    className="mr-2"
                    checked={selectedPaymentMethod === "qiwi"}
                    onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                  />
                  <span>QIWI</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="payment"
                    value="yoomoney"
                    className="mr-2"
                    checked={selectedPaymentMethod === "yoomoney"}
                    onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                  />
                  <span>{t("payment.yoomoney")}</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="payment"
                    value="crypto"
                    className="mr-2"
                    checked={selectedPaymentMethod === "crypto"}
                    onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                  />
                  <span>{t("payment.crypto")}</span>
                </label>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {t("common.cancel")}
              </button>
              <button
                onClick={async () => {
                  try {
                    if (!selectedPlan) return;
                    const token = localStorage.getItem("token");
                        const methodForBackend = selectedPaymentMethod;
                    const currency = userCountry === "RU" ? "RUB" : "USD";
                    const response = await fetch(
                      `${API_BASE_URL}/subscription/payment/create`,
                      {
                        method: "POST",
                        headers: {
                          "Content-Type": "application/json",
                          Authorization: `Bearer ${token}`,
                        },
                        body: JSON.stringify({
                          planId: selectedPlan.id,
                          paymentMethod: methodForBackend,
                          currency,
                          country: userCountry,
                        }),
                      }
                    );
                    const data = await response.json();
                    if (!response.ok) {
                      alert(`Error: ${data.message || "Payment failed"}`);
                      return;
                    }
                    if (data.payment?.redirectUrl) {
                      window.location.href = data.payment.redirectUrl;
                    } else {
                      alert("Payment created");
                      setShowPaymentModal(false);
                    }
                  } catch (err) {
                    console.error("Payment error:", err);
                    alert("Payment failed");
                  }
                }}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                {t("subscription.payment.pay")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubscriptionPage;
