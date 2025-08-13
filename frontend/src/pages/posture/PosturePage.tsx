import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Card } from "../../shared/ui/Card";
import Webcam from "react-webcam";
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-webgl";
import * as posedetection from "@tensorflow-models/pose-detection";
import { POSE_DETECTION_CONFIG, getAdaptiveConfig } from "../../shared/config/poseDetection";

type PoseDetector = posedetection.PoseDetector;

// Используем константы из конфигурации
const {
  VIDEO_WIDTH,
  VIDEO_HEIGHT,
  DETECT_INTERVAL_MS,
  BAD_ANGLE_THRESHOLD_DEG,
  NOTIFY_COOLDOWN_MS,
  MODEL_CONFIG,
  MIN_CONFIDENCE,
  SMOOTHING_FACTOR,
  SMOOTHING_WINDOW_MS,
  PERFORMANCE_UPDATE_INTERVAL,
  PERFORMANCE_HISTORY_SIZE,
  QUALITY_THRESHOLDS,
} = POSE_DETECTION_CONFIG;

function computeAngleDeg(
  ax: number,
  ay: number,
  bx: number,
  by: number,
  cx: number,
  cy: number
) {
  const v1x = ax - bx;
  const v1y = ay - by;
  const v2x = cx - bx;
  const v2y = cy - by;
  const dot = v1x * v2x + v1y * v2y;
  const n1 = Math.hypot(v1x, v1y);
  const n2 = Math.hypot(v2x, v2y);
  if (n1 === 0 || n2 === 0) return 0;
  const cos = Math.min(1, Math.max(-1, dot / (n1 * n2)));
  return (Math.acos(cos) * 180) / Math.PI;
}

const PosturePage: React.FC = () => {
  const webcamRef = useRef<Webcam | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const detectorRef = useRef<PoseDetector | null>(null);
  const [status, setStatus] = useState<"idle" | "running" | "error">("idle");
  const [lastNotifyTs, setLastNotifyTs] = useState<number>(0);
  const [neckAngle, setNeckAngle] = useState<number>(0);
  const [performance, setPerformance] = useState<{
    fps: number;
    avgProcessingTime: number;
    quality: 'high' | 'medium' | 'low';
  }>({ fps: 0, avgProcessingTime: 0, quality: 'high' });

  const videoConstraints = useMemo(
    () => ({
      width: VIDEO_WIDTH,
      height: VIDEO_HEIGHT,
      facingMode: "user" as const,
    }),
    []
  );

  const requestNotificationPermission = useCallback(async () => {
    if (!("Notification" in window)) return;
    if (Notification.permission === "default") {
      try {
        await Notification.requestPermission();
      } catch {}
    }
  }, []);

  const notifyIfNeeded = useCallback(
    (isBad: boolean, angle: number) => {
      const now = Date.now();
      if (!isBad) return;
      if (now - lastNotifyTs < NOTIFY_COOLDOWN_MS) return;
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("Check Your Posture", {
          body: `Neck tilt detected ~${angle.toFixed(0)}°. Straighten up.`,
        });
      }
      setLastNotifyTs(now);
    },
    [lastNotifyTs]
  );

  const logEvent = useCallback(async (isBad: boolean, angle: number) => {
    try {
      await fetch("/api/posture-events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: isBad ? "bad" : "good",
          metric: { neckAngleDeg: angle },
        }),
      });
    } catch {}
  }, []);

  const draw = useCallback(
    (ctx: CanvasRenderingContext2D, keypoints: any[]) => {
      ctx.clearRect(0, 0, VIDEO_WIDTH, VIDEO_HEIGHT);
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#22c55e";
      ctx.fillStyle = "#ef4444";
      for (const k of keypoints) {
        if (k.score != null && k.score < 0.4) continue;
        ctx.beginPath();
        ctx.arc(k.x, k.y, 3, 0, 2 * Math.PI);
        ctx.fill();
      }
    },
    []
  );

  // Кэш для последних результатов для сглаживания
  const lastResultsRef = useRef<{
    angle: number;
    timestamp: number;
    confidence: number;
  } | null>(null);

  // Кэш для мониторинга производительности
  const performanceRef = useRef<{
    frameTimes: number[];
    lastFrameTime: number;
    frameCount: number;
  }>({ frameTimes: [], lastFrameTime: 0, frameCount: 0 });

  // Адаптивная конфигурация в зависимости от производительности
  const getCurrentConfig = useCallback(() => {
    return getAdaptiveConfig(performance.quality);
  }, [performance.quality]);

  // Оптимизированная функция обработки позы
  const processPose = useCallback(async (detector: PoseDetector, video: HTMLVideoElement) => {
    const startTime = performance.now();
    const config = getCurrentConfig();
    
    try {
      const estimation = await detector.estimatePoses(video, config);
      const pose = estimation?.[0];
      
      if (!pose || !pose.keypoints) return null;

      const kp = Object.fromEntries(
        pose.keypoints.map((k: any) => [k.name, k])
      );
      
      const leftShoulder = kp["left_shoulder"] || kp["leftShoulder"];
      const rightShoulder = kp["right_shoulder"] || kp["rightShoulder"];
      const nose = kp["nose"];
      
      if (!leftShoulder || !rightShoulder || !nose) return null;

      // Проверяем уверенность ключевых точек
      if (leftShoulder.score < MIN_CONFIDENCE || 
          rightShoulder.score < MIN_CONFIDENCE || 
          nose.score < MIN_CONFIDENCE) {
        return null;
      }

      const midShoulderX = (leftShoulder.x + rightShoulder.x) / 2;
      const midShoulderY = (leftShoulder.y + rightShoulder.y) / 2;
      const angle = computeAngleDeg(
        nose.x,
        nose.y,
        midShoulderX,
        midShoulderY,
        midShoulderX,
        midShoulderY - 50
      );

      // Сглаживание результатов
      const now = Date.now();
      const lastResult = lastResultsRef.current;
      if (lastResult && now - lastResult.timestamp < SMOOTHING_WINDOW_MS) {
        const smoothedAngle = lastResult.angle * SMOOTHING_FACTOR + angle * (1 - SMOOTHING_FACTOR);
        lastResultsRef.current = { angle: smoothedAngle, timestamp: now, confidence: pose.score || 0 };
        return { angle: smoothedAngle, pose, confidence: pose.score || 0 };
      }

      lastResultsRef.current = { angle, timestamp: now, confidence: pose.score || 0 };
      return { angle, pose, confidence: pose.score || 0 };
    } catch (error) {
      console.error('Error processing pose:', error);
      return null;
    } finally {
      // Мониторинг производительности
      const processingTime = performance.now() - startTime;
      const perf = performanceRef.current;
      perf.frameTimes.push(processingTime);
      perf.frameCount++;
      
      // Ограничиваем размер массива для расчета среднего
      if (perf.frameTimes.length > PERFORMANCE_HISTORY_SIZE) {
        perf.frameTimes.shift();
      }
      
      // Обновляем статистику каждые N кадров
      if (perf.frameCount % PERFORMANCE_UPDATE_INTERVAL === 0) {
        const avgProcessingTime = perf.frameTimes.reduce((a, b) => a + b, 0) / perf.frameTimes.length;
        const fps = 1000 / avgProcessingTime;
        
        // Адаптивное качество
        let quality: 'high' | 'medium' | 'low' = 'high';
        if (fps < QUALITY_THRESHOLDS.LOW_FPS) quality = 'low';
        else if (fps < QUALITY_THRESHOLDS.MEDIUM_FPS) quality = 'medium';
        
        setPerformance({ fps: Math.round(fps), avgProcessingTime: Math.round(avgProcessingTime), quality });
      }
    }
  }, [getCurrentConfig]);

  // Предварительная загрузка модели
  useEffect(() => {
    const preloadModel = async () => {
      try {
        await tf.setBackend("webgl");
        await tf.ready();
        
        console.log('Preloading MoveNet model...');
        const detector = await posedetection.createDetector(
          posedetection.SupportedModels.MoveNet,
          MODEL_CONFIG
        );
        
        // Тестовый запуск для инициализации
        const dummyCanvas = document.createElement('canvas');
        dummyCanvas.width = 640;
        dummyCanvas.height = 480;
        await detector.estimatePoses(dummyCanvas);
        
        detectorRef.current = detector;
        console.log('MoveNet model preloaded successfully');
      } catch (error) {
        console.error('Error preloading model:', error);
      }
    };

    preloadModel();
  }, []);

  useEffect(() => {
    let intervalId: number | null = null;
    let isMounted = true;
    let frameCount = 0;

    const setup = async () => {
      try {
        await requestNotificationPermission();
        
        // Проверяем, что модель уже загружена
        if (!detectorRef.current) {
          console.log('Waiting for model to load...');
          await new Promise(resolve => {
            const checkModel = () => {
              if (detectorRef.current) {
                resolve(true);
              } else {
                setTimeout(checkModel, 100);
              }
            };
            checkModel();
          });
        }
        
        console.log('TensorFlow.js backend:', tf.getBackend());
        console.log('WebGL context:', tf.backend().gpgpu.gl.canvas);

        setStatus("running");

        intervalId = window.setInterval(async () => {
          if (!isMounted) return;
          
          const webcam = webcamRef.current;
          const canvas = canvasRef.current;
          const detector = detectorRef.current;
          if (!webcam || !webcam.video || !canvas || !detector) return;
          
          const video = webcam.video as HTMLVideoElement;
          if (video.readyState < 2) return;

          // Обработка позы
          const result = await processPose(detector, video);
          if (!result) return;

          // Отрисовка
          const ctx = canvas.getContext("2d");
          if (ctx) {
            draw(ctx, result.pose.keypoints || []);
          }

          // Обновление состояния
          setNeckAngle(result.angle);
          const isBad = result.angle > BAD_ANGLE_THRESHOLD_DEG;
          notifyIfNeeded(isBad, result.angle);
          logEvent(isBad, result.angle);

          // Логирование производительности каждые 100 кадров
          frameCount++;
          if (frameCount % 100 === 0) {
            console.log(`Processed ${frameCount} frames, current angle: ${result.angle.toFixed(1)}°`);
          }
        }, DETECT_INTERVAL_MS);
      } catch (e) {
        console.error('Setup error:', e);
        setStatus("error");
      }
    };

    setup();
    return () => {
      isMounted = false;
      if (intervalId) window.clearInterval(intervalId);
      detectorRef.current = null;
    };
  }, [draw, logEvent, notifyIfNeeded, requestNotificationPermission, processPose]);

  return (
    <div className="grid gap-6">
      <Card title="Posture Monitoring">
        <div className="flex items-center gap-4 mb-4">
          <span className="text-sm text-slate-600">Status:</span>
          <span
            className={`text-sm font-medium ${
              status === "running"
                ? "text-green-600"
                : status === "error"
                ? "text-red-600"
                : ""
            }`}
          >
            {status}
          </span>
          <span className="text-sm text-slate-600">
            Quality:{" "}
            <span className={`font-semibold ${
              performance.quality === 'high' ? 'text-green-600' :
              performance.quality === 'medium' ? 'text-yellow-600' :
              'text-red-600'
            }`}>
              {performance.quality}
            </span>
          </span>
          <span className="text-sm text-slate-600">
            FPS:{" "}
            <span className="font-semibold">{performance.fps}</span>
          </span>
          <span className="ml-auto text-sm">
            Neck angle:{" "}
            <span className="font-semibold">{neckAngle.toFixed(0)}°</span>
          </span>
        </div>
        <div
          className="relative rounded-2xl overflow-hidden border border-slate-200"
          style={{ width: VIDEO_WIDTH, height: VIDEO_HEIGHT }}
        >
          <Webcam
            ref={webcamRef}
            audio={false}
            mirrored
            videoConstraints={videoConstraints}
            style={{ width: VIDEO_WIDTH, height: VIDEO_HEIGHT }}
          />
          <canvas
            ref={canvasRef}
            width={VIDEO_WIDTH}
            height={VIDEO_HEIGHT}
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: VIDEO_WIDTH,
              height: VIDEO_HEIGHT,
            }}
          />
        </div>
        <p className="text-xs text-slate-500 mt-3">
          The camera is used locally for pose analysis. Only aggregated events
          without images are sent to the server.
        </p>
      </Card>
    </div>
  );
};

export default PosturePage;
