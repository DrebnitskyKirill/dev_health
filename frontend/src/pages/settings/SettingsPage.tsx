import React from 'react';

const SettingsPage: React.FC = () => {
  return (
    <section className="flex flex-col items-center justify-center h-full p-4">
      <h2 className="text-2xl font-bold mb-2">Настройки</h2>
      <p className="mb-4 text-center max-w-md">Здесь вы сможете настроить напоминания, темы и другие параметры.</p>
    </section>
  );
};

export default SettingsPage; 
