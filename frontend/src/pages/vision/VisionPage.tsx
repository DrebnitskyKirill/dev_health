import React from 'react';
import { VisionReminder } from '../../features';
import { Card } from '../../shared/ui/Card';
import { BlinkMonitor } from '../../features/visionReminder/BlinkMonitor';

const VisionPage: React.FC = () => {
  return (
    <div className="grid gap-6">
      <Card title="Зрение и перерывы">
        <p className="mb-4 text-sm text-slate-600">Следите за частотой моргания и делайте перерывы по правилу 20-20-20.</p>
        <VisionReminder />
      </Card>
      <Card title="Мониторинг моргания (экспериментально)">
        <BlinkMonitor />
      </Card>
    </div>
  );
};

export default VisionPage; 
