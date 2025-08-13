import React, { useState, useEffect } from "react";
import { useAuth } from "../../shared/context/AuthContext";
import { Card } from "../../shared/ui/Card";
import { Achievements, Leaderboard } from "../../entities";

const ProfilePage: React.FC = () => {
  const { user, token, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: user?.username || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({ ...prev, username: user.username }));
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const updateProfile = async () => {
    if (!user || !token) return;

    // Валидация паролей если они введены
    if (formData.newPassword || formData.currentPassword) {
      if (formData.newPassword !== formData.confirmPassword) {
        setMessage({ type: "error", text: "New passwords do not match" });
        return;
      }

      if (formData.newPassword.length < 6) {
        setMessage({
          type: "error",
          text: "Password must be at least 6 characters long",
        });
        return;
      }

      if (!formData.currentPassword) {
        setMessage({
          type: "error",
          text: "Current password is required to change password",
        });
        return;
      }
    }

    setIsLoading(true);
    setMessage(null);

    try {
      // Обновляем профиль
      const profileResponse = await fetch(
        "http://localhost:3001/api/auth/profile",
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            username: formData.username,
          }),
        }
      );

      const profileData = await profileResponse.json();

      if (!profileResponse.ok) {
        setMessage({
          type: "error",
          text: profileData.message || "Failed to update profile",
        });
        return;
      }

      // Если введен новый пароль, меняем его
      if (formData.newPassword && formData.currentPassword) {
        const passwordResponse = await fetch(
          "http://localhost:3001/api/auth/change-password",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              currentPassword: formData.currentPassword,
              newPassword: formData.newPassword,
            }),
          }
        );

        const passwordData = await passwordResponse.json();

        if (!passwordResponse.ok) {
          setMessage({
            type: "error",
            text: passwordData.message || "Failed to change password",
          });
          return;
        }

        // Обновляем данные пользователя в контексте
        if (passwordData.user) {
          updateUser(passwordData.user);
        }
      } else {
        // Обновляем только данные пользователя
        updateUser({ username: formData.username });
      }

      setMessage({ type: "success", text: "Profile updated successfully!" });
      setIsEditing(false);

      // Очищаем поля паролей
      setFormData((prev) => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      }));
    } catch (error) {
      setMessage({ type: "error", text: "Network error occurred" });
    } finally {
      setIsLoading(false);
    }
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setFormData((prev) => ({
      ...prev,
      username: user?.username || "",
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    }));
    setMessage(null);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-600">Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      {/* Профиль пользователя */}
      <div className="space-y-6">
          {/* Сообщения */}
          {message && (
            <div
              className={`p-4 rounded-lg ${
                message.type === "success"
                  ? "bg-green-50 text-green-800 border border-green-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}
            >
              {message.text}
            </div>
          )}
        </div>

      {/* Достижения и лидерборд */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Achievements />
          <div className="space-y-6 p-5">
            {!isEditing ? (
              <div className="space-y-3">
                <button
                  onClick={() => setIsEditing(true)}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Edit Name & Password
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Редактирование профиля */}
                <div>
                  <h4 className="text-md font-medium text-gray-800 mb-3">
                    Profile Settings
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Username
                      </label>
                      <input
                        type="text"
                        name="username"
                        value={formData.username}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter new username"
                      />
                    </div>
                  </div>
                </div>

                {/* Смена пароля */}
                <div>
                  <h4 className="text-md font-medium text-gray-800 mb-3">
                    Password Settings
                  </h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Leave password fields empty if you don't want to change your
                    password.
                  </p>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Current Password
                      </label>
                      <input
                        type="password"
                        name="currentPassword"
                        value={formData.currentPassword}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter current password (required for password change)"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        New Password
                      </label>
                      <input
                        type="password"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Enter new password (optional)"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Confirm New Password
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Confirm new password"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={updateProfile}
                    disabled={isLoading}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {isLoading ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="px-4 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        <div>
          <Leaderboard />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
