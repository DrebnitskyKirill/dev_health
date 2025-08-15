import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '../../shared/context/AuthContext';
import { API_BASE_URL } from '../../shared/config';
import { useLanguage } from '../../shared/context/LanguageContext';

const REMINDER_INTERVAL = 20 * 60; // 20 минут в секундах

interface VisionReminderState {
  seconds: number;
  isActive: boolean;
  remindersShown: number;
  startTime: number | null;
}

export const VisionReminder: React.FC = () => {
  const { user, token } = useAuth();
  const { t } = useLanguage();
  
  // Загрузка состояния из localStorage
  const loadReminderState = (): VisionReminderState => {
    try {
      const saved = localStorage.getItem('visionReminderState');
      if (saved) {
        const state: VisionReminderState = JSON.parse(saved);
        return state;
      }
    } catch (error) {
      console.error('Error loading reminder state:', error);
    }
    
    return {
      seconds: REMINDER_INTERVAL,
      isActive: false,
      remindersShown: 0,
      startTime: null
    };
  };

  const [reminderState, setReminderState] = useState<VisionReminderState>(loadReminderState);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Сохранение состояния в localStorage
  const saveReminderState = useCallback((state: VisionReminderState) => {
    try {
      localStorage.setItem('visionReminderState', JSON.stringify(state));
    } catch (error) {
      console.error('Error saving reminder state:', error);
    }
  }, []);

  // Обновление состояния с сохранением
  const updateReminderState = useCallback((updates: Partial<VisionReminderState>) => {
    setReminderState(prev => {
      const newState = { ...prev, ...updates };
      saveReminderState(newState);
      return newState;
    });
  }, [saveReminderState]);

  // Функция для показа уведомлений
  const showNotification = useCallback((title: string, body: string) => {
    try {
      if (!('Notification' in window)) {
        return;
      }
      (window as any).Notification(title, {
        body,
        tag: 'vision-reminder',
      });
    } catch (e) {
      // ignore in tests
    }
  }, []);

  // Запрос разрешения на уведомления
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  const updateStatistics = async () => {
    if (!user || !token) return;

    try {
      await fetch(`${API_BASE_URL}/gamification/update-statistics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          blinkReminders: 1, // Увеличиваем на 1
        }),
      });
    } catch (error) {
      console.error('Error updating statistics:', error);
    }
  };

  // Таймер
  useEffect(() => {
    if (reminderState.isActive) {
      intervalRef.current = setInterval(() => {
        setReminderState(prev => {
          const newSeconds = prev.seconds - 1;
          
          if (newSeconds <= 0) {
            showReminder();
            const newState: VisionReminderState = {
              ...prev,
              seconds: REMINDER_INTERVAL,
              isActive: false,
              startTime: null,
              remindersShown: prev.remindersShown + 1,
            };
            saveReminderState(newState);
            return newState;
          }
          
          const newState: VisionReminderState = {
            ...prev,
            seconds: newSeconds
          };
          
          saveReminderState(newState);
          return newState;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [reminderState.isActive, saveReminderState]);

  const showReminder = () => {
    updateStatistics();
    
    showNotification(
      'Vision Reminder!',
      'Look at something 20 feet away for 20 seconds!'
    );
  };

  const start = () => {
    updateReminderState({ 
      isActive: true, 
      startTime: Date.now() 
    });
  };
  
  const stop = () => {
    updateReminderState({ 
      isActive: false, 
      startTime: null 
    });
  };
  
  const reset = () => {
    updateReminderState({
      seconds: REMINDER_INTERVAL,
      isActive: false,
      startTime: null,
      remindersShown: 0
    });
  };

  const minutes = Math.floor(reminderState.seconds / 60).toString().padStart(2, '0');
  const secs = (reminderState.seconds % 60).toString().padStart(2, '0');

  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-white rounded-lg shadow-lg max-w-sm w-full">
      <div className="text-center mb-4">
        <div className="text-lg font-semibold mb-2">Vision Reminder</div>
        <div className="text-4xl md:text-6xl font-mono font-bold text-gray-800 mb-2">{minutes}:{secs}</div>
        <div className="text-sm text-gray-600">
          Every 20 minutes — 20 seconds looking into the distance
        </div>
      </div>

      {/* Объяснение важности привычки */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-left mb-4 w-full">
        <h3 className="font-semibold text-green-900 mb-2">💡 {t('vision.whyImportant.title')}</h3>
        <p className="text-sm text-green-800">
          {t('vision.whyImportant.subtitle')}
        </p>
        <ul className="text-sm text-green-800 mt-2 space-y-1">
          <li>• {t('vision.whyImportant.rule')}</li>
          <li>• {t('vision.whyImportant.duration')}</li>
          <li>• {t('vision.whyImportant.strain')}</li>
          <li>• {t('vision.whyImportant.computer')}</li>
        </ul>
      </div>

      <div className="flex gap-2 mb-4">
        <button 
          onClick={() => (reminderState.isActive ? stop() : start())}
          style={{ cursor: 'pointer' }}
          className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
        >
          {reminderState.isActive ? 'Pause' : 'Start'}
        </button>
        <button 
          onClick={reset} 
          style={{ cursor: 'pointer' }}
          className="px-6 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors font-medium"
        >
          Reset
        </button>
      </div>

      {/* Статистика */}
      <div className="w-full bg-gray-50 rounded-lg p-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">Reminders Shown: {reminderState.remindersShown}</div>
        </div>
      </div>

      {/* Подсказка по геймификации */}
      {user && (
        <div className="text-center text-sm text-gray-500 mt-2">
          💡 {t('vision.earnPoints')}
        </div>
      )}

      <div className="text-xs text-gray-500 text-center mt-2">
        {t('vision.ruleDescription')}
      </div>
    </div>
  );
}; 
