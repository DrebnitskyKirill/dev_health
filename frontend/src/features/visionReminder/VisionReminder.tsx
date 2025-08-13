import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '../../shared/context/AuthContext';

const REMINDER_INTERVAL = 20 * 60; // 20 минут в секундах

interface VisionReminderState {
  seconds: number;
  isActive: boolean;
  remindersShown: number;
  startTime: number | null;
}

export const VisionReminder: React.FC = () => {
  const { user, token } = useAuth();
  
  // Загрузка состояния из localStorage
  const loadReminderState = (): VisionReminderState => {
    try {
      const saved = localStorage.getItem('visionReminderState');
      if (saved) {
        const state: VisionReminderState = JSON.parse(saved);
        
        // Если таймер был активен, пересчитываем оставшееся время
        if (state.isActive && state.startTime) {
          const elapsed = Math.floor((Date.now() - state.startTime) / 1000);
          const newSeconds = Math.max(0, state.seconds - elapsed);
          
          return {
            ...state,
            seconds: newSeconds,
            isActive: newSeconds > 0, // Останавливаем если время истекло
            startTime: newSeconds > 0 ? state.startTime : null
          };
        }
        
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
    if (!("Notification" in window)) {
      console.log("This browser does not support notifications");
      return;
    }

    if (Notification.permission === "default") {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          new Notification(title, {
            body,
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            tag: 'vision-reminder',
            requireInteraction: true,
            silent: false
          });
        }
      });
    } else if (Notification.permission === "granted") {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'vision-reminder',
        requireInteraction: true,
        silent: false
      });
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
      await fetch('http://localhost:3001/api/gamification/update-statistics', {
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
              remindersShown: prev.remindersShown + 1
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
      '👁️ 20-20-20 Rule Reminder',
      'Look at an object 20 feet (6 meters) away for 20 seconds to protect your eyes!'
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
      remindersShown: 0
    });
  };

  const minutes = Math.floor(reminderState.seconds / 60).toString().padStart(2, '0');
  const secs = (reminderState.seconds % 60).toString().padStart(2, '0');

  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-white rounded-lg shadow-lg max-w-sm w-full">
      <div className="text-center mb-4">
        <div className="text-lg font-semibold mb-2">👁️ 20-20-20 Reminder</div>
        <div className="text-5xl font-mono font-bold text-gray-800 mb-2">{minutes}:{secs}</div>
        <div className="text-sm text-gray-600">
          Every 20 minutes — 20 seconds looking into the distance
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <button 
          onClick={start} 
          disabled={reminderState.isActive} 
          className="px-6 py-2 bg-green-500 text-white rounded-lg disabled:opacity-50 hover:bg-green-600 transition-colors font-medium"
        >
          {reminderState.isActive ? 'Running...' : 'Start'}
        </button>
        <button 
          onClick={stop} 
          disabled={!reminderState.isActive} 
          className="px-6 py-2 bg-red-500 text-white rounded-lg disabled:opacity-50 hover:bg-red-600 transition-colors font-medium"
        >
          Stop
        </button>
        <button 
          onClick={reset} 
          className="px-6 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors font-medium"
        >
          Reset
        </button>
      </div>

      {/* Статистика */}
      <div className="w-full bg-gray-50 rounded-lg p-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{reminderState.remindersShown}</div>
          <div className="text-sm text-gray-600">Reminders shown</div>
        </div>
      </div>

      {/* Подсказка по геймификации */}
      {user && (
        <div className="text-center text-sm text-gray-500 mt-2">
          💡 Each reminder earns health points!
        </div>
      )}

      <div className="text-xs text-gray-500 text-center mt-2">
        20-20-20 Rule: every 20 minutes of computer work, 
        look at an object 20 feet (6 meters) away for 20 seconds
      </div>
    </div>
  );
}; 
