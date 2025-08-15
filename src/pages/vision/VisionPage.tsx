import React from 'react';
import { VisionReminder } from '../../features';
import { Card } from '../../shared/ui/Card';
import { BlinkMonitor } from '../../features/visionReminder/BlinkMonitor';
import { useLanguage } from '../../shared/context/LanguageContext';

const VisionPage: React.FC = () => {
  const { t } = useLanguage();

  return (
    <div className="flex flex-row">
      <Card title={t('vision.title')}>
        <p className="mb-4 text-sm text-slate-600">{t('vision.subtitle')}</p>
        <VisionReminder />
      </Card>
      <Card title="Blink Monitoring (Experimental)">
        <BlinkMonitor />
      </Card>
    </div>
  );
};

export default VisionPage; 
