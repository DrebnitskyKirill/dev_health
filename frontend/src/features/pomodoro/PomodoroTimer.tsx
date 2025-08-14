import React, { useState, useRef, useEffect, useCallback } from "react";
import { useAuth } from "../../shared/context/AuthContext";
import { useLanguage } from "../../shared/context/LanguageContext";

const POMODORO_DURATION = 25 * 60; // 25 минут
const BREAK_DURATION = 5 * 60; // 5 минут
const LONG_BREAK_DURATION = 15 * 60; // 15 минут для длинного перерыва

type TimerMode = "work" | "break" | "longBreak";

interface TimerState {
  seconds: number;
  isActive: boolean;
  mode: TimerMode;
  completedSessions: number;
  totalWorkTime: number;
  startTime: number | null;
}

export const PomodoroTimer: React.FC = () => {
  const { user, token } = useAuth();
  const { t } = useLanguage();
  
  // Загрузка состояния из localStorage
  const loadTimerState = (): TimerState => {
    try {
      const saved = localStorage.getItem('pomodoroTimerState');
      if (saved) {
        const state: TimerState = JSON.parse(saved);
        
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
      console.error('Error loading timer state:', error);
    }
    
    return {
      seconds: POMODORO_DURATION,
      isActive: false,
      mode: "work",
      completedSessions: 0,
      totalWorkTime: 0,
      startTime: null
    };
  };

  const [timerState, setTimerState] = useState<TimerState>(loadTimerState);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Сохранение состояния в localStorage
  const saveTimerState = useCallback((state: TimerState) => {
    try {
      localStorage.setItem('pomodoroTimerState', JSON.stringify(state));
    } catch (error) {
      console.error('Error saving timer state:', error);
    }
  }, []);

  // Обновление состояния с сохранением
  const updateTimerState = useCallback((updates: Partial<TimerState>) => {
    setTimerState(prev => {
      const newState = { ...prev, ...updates };
      saveTimerState(newState);
      return newState;
    });
  }, [saveTimerState]);

  // Функция для показа уведомлений
  const showNotification = useCallback((title: string, body: string) => {
    // Проверяем поддержку уведомлений
    if (!("Notification" in window)) {
      console.log("This browser does not support notifications");
      return;
    }

    // Запрашиваем разрешение если нужно
    if (Notification.permission === "default") {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          new Notification(title, {
            body,
            icon: '/favicon.ico', // Можно заменить на свою иконку
            badge: '/favicon.ico',
            tag: 'pomodoro-timer',
            requireInteraction: true, // Уведомление не исчезнет автоматически
            silent: false
          });
        }
      });
    } else if (Notification.permission === "granted") {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        tag: 'pomodoro-timer',
        requireInteraction: true,
        silent: false
      });
    }
  }, []);

  const updateStatistics = async (sessionCompleted: boolean = false) => {
    if (!user || !token) return;

    try {
      const updates: any = {};

      if (sessionCompleted) {
        updates.pomodoroSessions = 1; // Увеличиваем на 1
        updates.totalWorkTime = POMODORO_DURATION * 1000; // В миллисекундах
      }

      await fetch("http://localhost:3001/api/gamification/update-statistics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });
    } catch (error) {
      console.error("Error updating statistics:", error);
    }
  };

  const start = () => {
    if (!timerState.isActive) {
      const startTime = Date.now();
      updateTimerState({ 
        isActive: true, 
        startTime 
      });
      
      intervalRef.current = setInterval(() => {
        setTimerState(prev => {
          const newSeconds = prev.seconds - 1;
          
          if (newSeconds <= 0) {
            clearInterval(intervalRef.current!);
            
            if (prev.mode === "work") {
              // Завершен рабочий сеанс
              const newCompletedSessions = prev.completedSessions + 1;
              const newTotalWorkTime = prev.totalWorkTime + POMODORO_DURATION;
              
              // Показываем уведомление
              showNotification(
                "🍅 Work Session Complete!", 
                "Great job! Time for a break. Take a moment to stretch and relax."
              );
              
              updateStatistics(true);
              
              // Определяем следующий режим
              const nextMode: TimerMode = newCompletedSessions % 4 === 0 ? "longBreak" : "break";
              const nextDuration = nextMode === "longBreak" ? LONG_BREAK_DURATION : BREAK_DURATION;
              
              const newState: TimerState = {
                ...prev,
                isActive: false,
                startTime: null,
                completedSessions: newCompletedSessions,
                totalWorkTime: newTotalWorkTime,
                mode: nextMode,
                seconds: nextDuration
              };
              
              saveTimerState(newState);
              return newState;
            } else {
              // Завершен перерыв
              const isLongBreak = prev.mode === "longBreak";
              
              showNotification(
                isLongBreak ? "☕ Long Break Complete!" : "☕ Break Complete!",
                isLongBreak 
                  ? "Ready to start a new work cycle? Let's get productive!"
                  : "Break time is over. Ready to focus on your next task?"
              );
              
              const newState: TimerState = {
                ...prev,
                isActive: false,
                startTime: null,
                mode: "work" as TimerMode,
                seconds: POMODORO_DURATION
              };
              
              saveTimerState(newState);
              return newState;
            }
          }
          
          const newState: TimerState = {
            ...prev,
            seconds: newSeconds
          };
          
          saveTimerState(newState);
          return newState;
        });
      }, 1000);
    }
  };

  const stop = () => {
    updateTimerState({ 
      isActive: false, 
      startTime: null 
    });
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const reset = () => {
    stop();
    updateTimerState({
      mode: "work" as TimerMode,
      seconds: POMODORO_DURATION,
      completedSessions: 0,
      totalWorkTime: 0
    });
  };

  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const minutes = Math.floor(timerState.seconds / 60)
    .toString()
    .padStart(2, "0");
  const secs = (timerState.seconds % 60).toString().padStart(2, "0");

  const getModeDisplay = () => {
    switch (timerState.mode) {
      case "work":
        return { icon: "🍅", title: t('pomodoro.work'), subtitle: t('pomodoro.focusTask') };
      case "break":
        return { icon: "☕", title: t('pomodoro.break'), subtitle: t('pomodoro.restRelax') };
      case "longBreak":
        return { icon: "🌟", title: t('pomodoro.longBreak'), subtitle: t('pomodoro.longerRest') };
      default:
        return { icon: "🍅", title: t('pomodoro.work'), subtitle: t('pomodoro.focusTask') };
    }
  };

  const modeDisplay = getModeDisplay();

  return (
    <div className="flex flex-col items-center gap-4 p-6 bg-white rounded-lg shadow-lg max-w-sm w-full">
      <div className="text-center mb-4">
        <div className="text-lg font-semibold mb-2">
          {modeDisplay.icon} {modeDisplay.title}
        </div>
        <div className="text-5xl font-mono font-bold text-gray-800 mb-2">
          {minutes}:{secs}
        </div>
        <div className="text-sm text-gray-600">
          {modeDisplay.subtitle}
        </div>
      </div>

      {/* Объяснение важности привычки */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left mb-4 w-full">
        <h3 className="font-semibold text-blue-900 mb-2">💡 {t('pomodoro.whyImportant.title')}</h3>
        <p className="text-sm text-blue-800">
          {t('pomodoro.whyImportant.subtitle')}
        </p>
        <ul className="text-sm text-blue-800 mt-2 space-y-1">
          <li>• {t('pomodoro.whyImportant.focus')}</li>
          <li>• {t('pomodoro.whyImportant.eyes')}</li>
          <li>• {t('pomodoro.whyImportant.burnout')}</li>
          <li>• {t('pomodoro.whyImportant.quality')}</li>
        </ul>
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={start}
          disabled={timerState.isActive}
          className="px-6 py-2 bg-green-500 text-white rounded-lg disabled:opacity-50 hover:bg-green-600 transition-colors font-medium"
        >
          {timerState.isActive ? t('pomodoro.working') : t('pomodoro.start')}
        </button>
        <button
          onClick={stop}
          disabled={!timerState.isActive}
          className="px-6 py-2 bg-red-500 text-white rounded-lg disabled:opacity-50 hover:bg-red-600 transition-colors font-medium"
        >
          {t('pomodoro.stop')}
        </button>
        <button
          onClick={reset}
          className="px-6 py-2 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-colors font-medium"
        >
          {t('pomodoro.reset')}
        </button>
      </div>

      {/* Статистика */}
      <div className="w-full bg-gray-50 rounded-lg p-4">
        <div className="grid grid-cols-2 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-indigo-600">
              {timerState.completedSessions}
            </div>
            <div className="text-sm text-gray-600">{t('pomodoro.sessionsCompleted')}</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              {Math.floor(timerState.totalWorkTime / 60)}
            </div>
            <div className="text-sm text-gray-600">{t('pomodoro.minutesWorked')}</div>
          </div>
        </div>
      </div>

      {/* Индикатор следующего длинного перерыва */}
      {timerState.completedSessions > 0 && (
        <div className="text-center text-sm text-gray-500">
          {timerState.completedSessions % 4 === 0 ? (
            <span className="text-purple-600">🌟 {t('pomodoro.nextLongBreak')}!</span>
          ) : (
            <span>{t('pomodoro.nextLongBreak')} {4 - (timerState.completedSessions % 4)} {t('pomodoro.sessions')}</span>
          )}
        </div>
      )}

      {/* Подсказка по геймификации */}
      {user && (
        <div className="text-center text-sm text-gray-500 mt-2">
          💡 {t('pomodoro.earnPoints')}
        </div>
      )}
    </div>
  );
};
