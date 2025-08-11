import React, { useEffect, useRef, useState } from 'react';

const REMINDER_INTERVAL = 20 * 60; // 20 минут в секундах

export const VisionReminder: React.FC = () => {
  const [seconds, setSeconds] = useState(REMINDER_INTERVAL);
  const [isActive, setIsActive] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Запрос разрешения на уведомления
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, []);

  // Таймер
  useEffect(() => {
    if (isActive) {
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => {
          if (prev <= 1) {
            showReminder();
            return REMINDER_INTERVAL;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isActive]);

  const showReminder = () => {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('Правило 20-20-20', {
        body: 'Посмотрите на объект в 20 футах (6 метров) на 20 секунд!',
      });
    } else {
      alert('Посмотрите на объект в 20 футах (6 метров) на 20 секунд!');
    }
  };

  const start = () => setIsActive(true);
  const stop = () => setIsActive(false);
  const reset = () => setSeconds(REMINDER_INTERVAL);

  const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');

  return (
    <div className="flex flex-col items-center gap-4 p-4 bg-white rounded shadow max-w-xs w-full">
      <div className="text-lg font-semibold mb-2">Напоминание 20-20-20</div>
      <div className="text-5xl font-mono mb-4">{minutes}:{secs}</div>
      <div className="flex gap-2">
        <button onClick={start} disabled={isActive} className="px-4 py-2 bg-green-500 text-white rounded disabled:opacity-50">Старт</button>
        <button onClick={stop} disabled={!isActive} className="px-4 py-2 bg-red-500 text-white rounded disabled:opacity-50">Стоп</button>
        <button onClick={reset} className="px-4 py-2 bg-gray-300 text-gray-800 rounded">Сброс</button>
      </div>
      <div className="text-xs text-gray-500 text-center">Каждые 20 минут — 20 секунд смотреть вдаль (6 метров)</div>
    </div>
  );
}; 
