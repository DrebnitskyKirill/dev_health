import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../shared/ui/Card';

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card title="Обзор">
        <p className="text-sm text-slate-600">Следите за здоровьем за компьютером: осанка, зрение, режим работы. Здесь будет отображаться ваша статистика и советы.</p>
      </Card>
      <Card title="Быстрые действия">
        <div className="flex flex-wrap gap-2">
          <button
            className="pill pill-active"
            type="button"
            onClick={() => navigate('/posture')}
          >
            Начать мониторинг осанки
          </button>
          <button
            className="pill pill-muted"
            type="button"
            onClick={() => navigate('/vision')}
          >
            Напоминания 20-20-20
          </button>
        </div>
      </Card>
    </div>
  );
};

export default DashboardPage; 
