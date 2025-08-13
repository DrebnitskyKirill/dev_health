import React from 'react';
import { VisionReminder } from '../../features';
import { Card } from '../../shared/ui/Card';
import { BlinkMonitor } from '../../features/visionReminder/BlinkMonitor';

const VisionPage: React.FC = () => {
  return (
    <div className="flex flex-row">
      <Card title="Vision and Breaks">
        <p className="mb-4 text-sm text-slate-600">Monitor your blink rate and take breaks following the 20-20-20 rule.</p>
        <VisionReminder />
      </Card>
      <Card title="Blink Monitoring (Experimental)">
        <BlinkMonitor />
      </Card>
    </div>
  );
};

export default VisionPage; 
