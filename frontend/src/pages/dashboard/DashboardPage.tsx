import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../shared/context/AuthContext";
import { Card } from "../../shared/ui/Card";
import { AchievementsWidget } from "../../features/achievements/AchievementsWidget";
import { LeaderboardWidget } from "../../features/leaderboard/LeaderboardWidget";

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Welcome to DevHealth!
        </h2>
        <p className="text-gray-600 mb-6">
          Sign in to start tracking your health and compete with colleagues
        </p>
        <button
          onClick={() => navigate("/auth")}
          className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Sign In
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
            Hello, {user.username}! 👋
          </h1>
          <p className="text-gray-600">
            Track your computer health and compete with colleagues
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-sm text-gray-500">Level</div>
            <div className="text-2xl font-bold text-indigo-600">
              {user.level}
            </div>
          </div>
        </div>
      </div>

      {/* Быстрые действия */}
      <Card title="Quick Actions">
        <div className="flex flex-wrap gap-3">
          <button
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            onClick={() => navigate("/posture")}
          >
            🧍 Start Posture Monitoring
          </button>
          <button
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            onClick={() => navigate("/vision")}
          >
            👁️ 20-20-20 Reminders
          </button>
          <button
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            onClick={() => navigate("/workmode")}
          >
            ⏰ Work Mode
          </button>
        </div>
      </Card>

      {/* Статистика */}
      <Card title="Your Statistics">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {user.healthScore}
            </div>
            <div className="text-sm text-blue-600">Health Points</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {user.badges?.length || 0}
            </div>
            <div className="text-sm text-green-600">Badges Earned</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {user.level}
            </div>
            <div className="text-sm text-purple-600">Current Level</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">∞</div>
            <div className="text-sm text-orange-600">Growth Potential</div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DashboardPage;
