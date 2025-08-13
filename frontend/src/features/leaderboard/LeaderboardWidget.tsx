import React, { useState, useEffect } from "react";
import { Card } from "../../shared/ui/Card";

interface LeaderboardEntry {
  username: string;
  healthScore: number;
  level: number;
  badges: string[];
}

export const LeaderboardWidget: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(
        "http://localhost:3001/api/gamification/leaderboard"
      );

      if (response.ok) {
        const data = await response.json();
        setLeaderboard(data.leaderboard);
      }
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 0:
        return "🥇";
      case 1:
        return "🥈";
      case 2:
        return "🥉";
      default:
        return `#${position + 1}`;
    }
  };

  const getPositionColor = (position: number) => {
    switch (position) {
      case 0:
        return "bg-yellow-100 text-yellow-800";
      case 1:
        return "bg-gray-100 text-gray-800";
      case 2:
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-50 text-gray-600";
    }
  };

  if (isLoading) {
    return (
      <Card>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-12 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Health Leaderboard
        </h3>
        <button
          onClick={fetchLeaderboard}
          className="text-sm text-indigo-600 hover:text-indigo-500 font-medium"
        >
          Refresh
        </button>
      </div>

      {leaderboard.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No data to display yet
        </div>
      ) : (
        <div className="space-y-3">
          {leaderboard.map((entry, index) => (
            <div
              key={index}
              className={`flex items-center p-3 rounded-lg ${getPositionColor(
                index
              )}`}
            >
              <div className="flex-shrink-0 w-8 text-center font-bold text-lg">
                {getPositionIcon(index)}
              </div>

              <div className="flex-1 ml-3">
                <div className="font-medium text-gray-900">
                  {entry.username}
                </div>
                <div className="text-sm text-gray-600">
                  Level {entry.level} • {entry.badges?.length || 0} badges
                </div>
              </div>

              <div className="text-right">
                <div className="text-lg font-bold text-indigo-600">
                  {entry.healthScore}
                </div>
                <div className="text-xs text-gray-500">points</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="text-center">
          <p className="text-sm text-gray-500">
            Compete with colleagues for a healthy lifestyle!
          </p>
          <p className="text-xs text-gray-400 mt-1">
            Complete tasks and earn health points
          </p>
        </div>
      </div>
    </Card>
  );
};
