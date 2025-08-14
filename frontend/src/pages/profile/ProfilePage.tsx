import React, { useState, useEffect } from "react";
import { useAuth } from "../../shared/context/AuthContext";
import { Card } from "../../shared/ui/Card";
import { Achievements, Leaderboard } from "../../entities";
import { useLanguage } from "../../shared/context/LanguageContext";
import { API_BASE_URL } from "../../shared/config";

const ProfilePage: React.FC = () => {
  const { user, token, updateUser } = useAuth();
  const { language, setLanguage, t } = useLanguage();

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
  const [notificationMessage, setNotificationMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [isSendingNotification, setIsSendingNotification] = useState(false);

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
        `${API_BASE_URL}/auth/profile`,
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
          `${API_BASE_URL}/auth/change-password`,
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

  const testNotification = async (type: string) => {
    if (!token) return;

    setIsSendingNotification(true);
    setNotificationMessage(null);

    try {
      let endpoint = '';
      let body = {};

      switch (type) {
        case 'welcome':
          endpoint = '/api/notifications/welcome';
          break;
        case 'achievement':
          endpoint = '/api/notifications/achievement';
          body = {
            achievementName: 'Тестовое достижение',
            achievementDescription: 'Это тестовое достижение для проверки email уведомлений'
          };
          break;
        case 'daily':
          endpoint = '/api/notifications/daily-reminder';
          break;
        case 'weekly':
          endpoint = '/api/notifications/weekly-report';
          body = {
            healthScore: user?.healthScore || 100,
            level: user?.level || 1,
            sessionsCompleted: 5,
            remindersShown: 10
          };
          break;
        default:
          throw new Error('Неизвестный тип уведомления');
      }

      const response = await fetch(`${API_BASE_URL.replace(/\/api$/, '')}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: Object.keys(body).length > 0 ? JSON.stringify(body) : undefined,
      });

      const data = await response.json();

      if (response.ok) {
        setNotificationMessage({
          type: "success",
          text: data.message || "Уведомление отправлено успешно!"
        });
      } else {
        setNotificationMessage({
          type: "error",
          text: data.message || "Ошибка отправки уведомления"
        });
      }
    } catch (error) {
      setNotificationMessage({
        type: "error",
        text: "Ошибка сети при отправке уведомления"
      });
    } finally {
      setIsSendingNotification(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-600">Please log in to view your profile.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Сообщения */}
      {message && (
        <div
          className={`p-4 rounded-lg max-w-2xl mx-auto ${
            message.type === "success"
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Основной контент */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Левая колонка - Достижения */}
        <div className="lg:col-span-2 space-y-8">
          <Achievements />

          {/* Настройки профиля */}
          <Card title={t("profile.profileSettings")}>
            <div className="space-y-6">
              {!isEditing ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h4 className="font-medium text-gray-900">
                        {t("profile.username")}
                      </h4>
                      <p className="text-gray-600">{user.username}</p>
                    </div>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      {t("profile.edit")}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Редактирование профиля */}
                  <div>
                    <h4 className="text-lg font-medium text-gray-800 mb-4">
                      {t("profile.editProfile")}
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t("profile.username")}
                        </label>
                        <input
                          type="text"
                          name="username"
                          value={formData.username}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                          placeholder={t("profile.enterUsername")}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Смена пароля */}
                  <div>
                    <h4 className="text-lg font-medium text-gray-800 mb-4">
                      {t("profile.passwordSettings")}
                    </h4>
                    <p className="text-sm text-gray-600 mb-4">
                      {t("profile.passwordChangeNote")}
                    </p>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t("profile.currentPassword")}
                        </label>
                        <input
                          type="password"
                          name="currentPassword"
                          value={formData.currentPassword}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                          placeholder={t("profile.enterCurrentPassword")}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t("profile.newPassword")}
                        </label>
                        <input
                          type="password"
                          name="newPassword"
                          value={formData.newPassword}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                          placeholder={t("profile.enterNewPassword")}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {t("profile.confirmPassword")}
                        </label>
                        <input
                          type="password"
                          name="confirmPassword"
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                          placeholder={t("profile.confirmNewPassword")}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={updateProfile}
                      disabled={isLoading}
                      className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 font-medium"
                    >
                      {isLoading
                        ? t("profile.saving")
                        : t("profile.saveChanges")}
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="px-6 py-3 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors font-medium"
                    >
                      {t("profile.cancel")}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </Card>

          {/* Настройки приложения */}
          <Card title={t("settings.title")}>
            <div className="space-y-8">
              {/* Язык */}
              <div>
                <h4 className="text-lg font-medium text-gray-800 mb-4">
                  {t("settings.language")}
                </h4>
                <p className="text-gray-600 mb-4">
                  {t("settings.languageDescription")}
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setLanguage("en")}
                    className={`px-6 py-3 rounded-lg border transition-colors font-medium ${
                      language === "en"
                        ? "bg-blue-600 text-white border-blue-600 shadow-md"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400"
                    }`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => setLanguage("ru")}
                    className={`px-6 py-3 rounded-lg border transition-colors font-medium ${
                      language === "ru"
                        ? "bg-blue-600 text-white border-blue-600 shadow-md"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400"
                    }`}
                  >
                    Русский
                  </button>
                </div>
              </div>

              {/* Уведомления */}
              <div>
                <h4 className="text-lg font-medium text-gray-800 mb-4">
                  {t("settings.notifications")}
                </h4>
                <p className="text-gray-600 mb-4">
                  {t("settings.notificationsDescription")}
                </p>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <span className="text-gray-700 font-medium">
                      {t("settings.emailNotifications")}
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        defaultChecked
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <span className="text-gray-700 font-medium">
                      {t("settings.pushNotifications")}
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        defaultChecked
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>

                {/* Тестирование уведомлений */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <h5 className="text-md font-medium text-blue-800 mb-3">
                    Тестирование Email уведомлений
                  </h5>
                  <p className="text-sm text-blue-600 mb-4">
                    Проверьте работу email уведомлений, отправив тестовые письма
                  </p>
                  
                  {notificationMessage && (
                    <div
                      className={`p-3 rounded-lg mb-4 ${
                        notificationMessage.type === "success"
                          ? "bg-green-100 text-green-800 border border-green-200"
                          : "bg-red-100 text-red-800 border border-red-200"
                      }`}
                    >
                      {notificationMessage.text}
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => testNotification('welcome')}
                      disabled={isSendingNotification}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm"
                    >
                      {isSendingNotification ? 'Отправка...' : 'Приветствие'}
                    </button>
                    <button
                      onClick={() => testNotification('achievement')}
                      disabled={isSendingNotification}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 text-sm"
                    >
                      {isSendingNotification ? 'Отправка...' : 'Достижение'}
                    </button>
                    <button
                      onClick={() => testNotification('daily')}
                      disabled={isSendingNotification}
                      className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 text-sm"
                    >
                      {isSendingNotification ? 'Отправка...' : 'Ежедневное'}
                    </button>
                    <button
                      onClick={() => testNotification('weekly')}
                      disabled={isSendingNotification}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 text-sm"
                    >
                      {isSendingNotification ? 'Отправка...' : 'Еженедельное'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Правая колонка - Лидерборд */}
        <div className="lg:col-span-1">
          <Leaderboard />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
