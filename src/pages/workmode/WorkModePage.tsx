import React from 'react';
import { PomodoroTimer } from '../../features/pomodoro/PomodoroTimer';

const WorkModePage: React.FC = () => {
  return (
    <section className="flex flex-col items-center justify-center h-full p-4 gap-6">
      <h2 className="text-2xl font-bold mb-2">Режим работы</h2>
      <p className="mb-4 text-center max-w-md">Таймер Pomodoro и напоминания о перерывах помогут вам работать продуктивно и заботиться о здоровье.</p>
      <PomodoroTimer />
    </section>
  );
};

export default WorkModePage; 
