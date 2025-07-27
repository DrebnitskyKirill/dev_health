import React, { useState, useRef } from 'react';

const POMODORO_DURATION = 25 * 60; // 25 минут
const BREAK_DURATION = 5 * 60; // 5 минут

type TimerMode = 'work' | 'break';

export const PomodoroTimer: React.FC = () => {
  const [seconds, setSeconds] = useState(POMODORO_DURATION);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<TimerMode>('work');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const start = () => {
    if (!isActive) {
      setIsActive(true);
      intervalRef.current = setInterval(() => {
        setSeconds((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            setIsActive(false);
            if (mode === 'work') {
              setMode('break');
              setSeconds(BREAK_DURATION);
            } else {
              setMode('work');
              setSeconds(POMODORO_DURATION);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  };

  const stop = () => {
    setIsActive(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const reset = () => {
    stop();
    setMode('work');
    setSeconds(POMODORO_DURATION);
  };

  React.useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const minutes = Math.floor(seconds / 60).toString().padStart(2, '0');
  const secs = (seconds % 60).toString().padStart(2, '0');

  return (
    <div className="flex flex-col items-center gap-4 p-4 bg-white rounded shadow max-w-xs w-full">
      <div className="text-lg font-semibold mb-2">{mode === 'work' ? 'Работа' : 'Перерыв'}</div>
      <div className="text-5xl font-mono mb-4">{minutes}:{secs}</div>
      <div className="flex gap-2">
        <button onClick={start} disabled={isActive} className="px-4 py-2 bg-green-500 text-white rounded disabled:opacity-50">Старт</button>
        <button onClick={stop} disabled={!isActive} className="px-4 py-2 bg-red-500 text-white rounded disabled:opacity-50">Стоп</button>
        <button onClick={reset} className="px-4 py-2 bg-gray-300 text-gray-800 rounded">Сброс</button>
      </div>
    </div>
  );
}; 
