import * as posedetection from "@tensorflow-models/pose-detection";

// Оптимизированные константы для производительности
export const POSE_DETECTION_CONFIG = {
  // Размеры видео
  VIDEO_WIDTH: 640,
  VIDEO_HEIGHT: 480,
  
  // Частота обработки
  DETECT_INTERVAL_MS: 200, // 5 fps для лучшего UX
  
  // Пороги для определения плохой осанки
  BAD_ANGLE_THRESHOLD_DEG: 25, // угол наклона шеи
  NOTIFY_COOLDOWN_MS: 60_000, // не чаще раза в минуту
  
  // Конфигурация модели MoveNet
  MODEL_CONFIG: {
    modelType: posedetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
    scoreThreshold: 0.3, // Снижен порог для лучшего обнаружения
    maxPoseDetections: 1, // Только одна поза для производительности
    enableSmoothing: true, // Сглаживание для стабильности
    enableSegmentation: false, // Отключаем сегментацию для скорости
  } as const,
  
  // Пороги уверенности для ключевых точек
  MIN_CONFIDENCE: 0.4,
  
  // Параметры сглаживания
  SMOOTHING_FACTOR: 0.7,
  SMOOTHING_WINDOW_MS: 500,
  
  // Параметры мониторинга производительности
  PERFORMANCE_UPDATE_INTERVAL: 30, // кадров
  PERFORMANCE_HISTORY_SIZE: 30, // кадров
  
  // Адаптивные пороги качества
  QUALITY_THRESHOLDS: {
    LOW_FPS: 3,
    MEDIUM_FPS: 4,
  },
  
  // Адаптивные конфигурации
  ADAPTIVE_CONFIGS: {
    low: {
      scoreThreshold: 0.5, // Повышаем порог для ускорения
      enableSmoothing: false, // Отключаем сглаживание
    },
    medium: {
      scoreThreshold: 0.4,
      enableSmoothing: true,
    },
    high: {
      scoreThreshold: 0.3,
      enableSmoothing: true,
    },
  },
} as const;

// Функция для получения адаптивной конфигурации
export const getAdaptiveConfig = (quality: 'high' | 'medium' | 'low') => {
  const baseConfig = { ...POSE_DETECTION_CONFIG.MODEL_CONFIG };
  const adaptiveConfig = POSE_DETECTION_CONFIG.ADAPTIVE_CONFIGS[quality];
  
  return {
    ...baseConfig,
    ...adaptiveConfig,
  };
};
