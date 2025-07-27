import React from 'react';
import { VisionReminder } from '../../features';

const VisionPage: React.FC = () => {
  return (
    <section className="flex flex-col items-center justify-center h-full p-4 gap-6">
      <h2 className="text-2xl font-bold mb-2">Зрение и перерывы</h2>
      <p className="mb-4 text-center max-w-md">Напоминания о правиле 20-20-20 и упражнения для глаз появятся здесь.</p>
      <VisionReminder />
    </section>
  );
};

export default VisionPage; 
