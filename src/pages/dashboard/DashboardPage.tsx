import React from 'react';

const DashboardPage: React.FC = () => {
  return (
    <section className="flex flex-col items-center justify-center h-full p-4">
      <h2 className="text-2xl font-bold mb-2">Добро пожаловать!</h2>
      <p className="mb-4 text-center max-w-md">Следите за здоровьем за компьютером: осанка, зрение, режим работы. Здесь будет отображаться ваша статистика и советы.</p>
    </section>
  );
};

export default DashboardPage; 
