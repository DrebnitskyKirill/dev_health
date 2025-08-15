import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../shared/context/AuthContext";
import { useLanguage } from "../../shared/context/LanguageContext";
import { Card } from "../../shared/ui/Card";

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useLanguage();

  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {t('dashboard.welcomeToDevHealth')}
        </h2>
        <p className="text-gray-600 mb-6">
          {t('dashboard.signInToStart')}
        </p>
        <button
          onClick={() => navigate("/auth")}
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          {t('dashboard.signIn')}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Приветствие и профиль */}
      <div className="flex items-center justify-between p-5">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {t('dashboard.hello')}, {user.username}! 👋
          </h1>
          <p className="text-gray-600">
            {t('dashboard.trackHealth')}
          </p>
        </div>
      </div>

      {/* Быстрые действия */}
      <Card title={t('dashboard.quickActions')}>
        <div className="flex flex-wrap gap-3">
          <button
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            onClick={() => navigate("/posture")}
          >
            🧍 {t('dashboard.monitorPosture')}
          </button>
          <button
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            onClick={() => navigate("/vision")}
          >
            👁️ {t('dashboard.startVisionReminder')}
          </button>
          <button
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            onClick={() => navigate("/workmode")}
          >
            ⏰ {t('dashboard.startPomodoro')}
          </button>
        </div>
      </Card>

      {/* Статистика */}
      <Card title={t('dashboard.achievements')}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {user.healthScore}
            </div>
            <div className="text-sm text-blue-600">{t('dashboard.healthPoints')}</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {user.badges?.length || 0}
            </div>
            <div className="text-sm text-green-600">{t('dashboard.badgesEarned')}</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {user.level}
            </div>
            <div className="text-sm text-purple-600">{t('dashboard.currentLevel')}</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">∞</div>
            <div className="text-sm text-orange-600">{t('dashboard.growthPotential')}</div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DashboardPage;
