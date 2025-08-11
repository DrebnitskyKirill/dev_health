import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Card } from '../../shared/ui/Card';
import Webcam from 'react-webcam';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';
import * as posedetection from '@tensorflow-models/pose-detection';

type PoseDetector = posedetection.PoseDetector;

const VIDEO_WIDTH = 640;
const VIDEO_HEIGHT = 480;
const DETECT_INTERVAL_MS = 250; // 4 fps достаточно для UX
const BAD_ANGLE_THRESHOLD_DEG = 25; // угол наклона шеи
const NOTIFY_COOLDOWN_MS = 60_000; // не чаще раза в минуту

function computeAngleDeg(ax: number, ay: number, bx: number, by: number, cx: number, cy: number) {
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
  const [status, setStatus] = useState<'idle' | 'running' | 'error'>('idle');
  const [lastNotifyTs, setLastNotifyTs] = useState<number>(0);
  const [neckAngle, setNeckAngle] = useState<number>(0);

  const videoConstraints = useMemo(
    () => ({ width: VIDEO_WIDTH, height: VIDEO_HEIGHT, facingMode: 'user' as const }),
    []
  );

  const requestNotificationPermission = useCallback(async () => {
    if (!('Notification' in window)) return;
    if (Notification.permission === 'default') {
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
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('Проверьте осанку', {
          body: `Замечен наклон шеи ~${angle.toFixed(0)}°. Выпрямитесь.`,
        });
      }
      setLastNotifyTs(now);
    },
    [lastNotifyTs]
  );

  const logEvent = useCallback(async (isBad: boolean, angle: number) => {
    try {
      await fetch('/api/posture-events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: isBad ? 'bad' : 'good', metric: { neckAngleDeg: angle } }),
      });
    } catch {}
  }, []);

  const draw = useCallback((ctx: CanvasRenderingContext2D, keypoints: any[]) => {
    ctx.clearRect(0, 0, VIDEO_WIDTH, VIDEO_HEIGHT);
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#22c55e';
    ctx.fillStyle = '#ef4444';
    for (const k of keypoints) {
      if (k.score != null && k.score < 0.4) continue;
      ctx.beginPath();
      ctx.arc(k.x, k.y, 3, 0, 2 * Math.PI);
      ctx.fill();
    }
  }, []);

  useEffect(() => {
    let intervalId: number | null = null;
    let isMounted = true;

    const setup = async () => {
      try {
        await requestNotificationPermission();
        await tf.setBackend('webgl');
        await tf.ready();
        const detector = await posedetection.createDetector(
          posedetection.SupportedModels.BlazePose,
          {
            runtime: 'mediapipe',
            modelType: 'lite',
            solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/pose',
          } as posedetection.BlazePoseMediaPipeModelConfig
        );
        detectorRef.current = detector as unknown as PoseDetector;
        setStatus('running');

        intervalId = window.setInterval(async () => {
          const webcam = webcamRef.current;
          const canvas = canvasRef.current;
          if (!webcam || !webcam.video || !canvas) return;
          const video = webcam.video as HTMLVideoElement;
          if (video.readyState < 2) return;
          const estimation = await detector.estimatePoses(video);
          const pose = estimation?.[0];
          const ctx = canvas.getContext('2d');
          if (!pose || !ctx) return;
          draw(ctx, pose.keypoints || []);

          const kp = Object.fromEntries((pose.keypoints || []).map((k: any) => [k.name, k]));
          const leftShoulder = kp['left_shoulder'] || kp['leftShoulder'];
          const rightShoulder = kp['right_shoulder'] || kp['rightShoulder'];
          const nose = kp['nose'];
          if (leftShoulder && rightShoulder && nose) {
            const midShoulderX = (leftShoulder.x + rightShoulder.x) / 2;
            const midShoulderY = (leftShoulder.y + rightShoulder.y) / 2;
            const angle = computeAngleDeg(nose.x, nose.y, midShoulderX, midShoulderY, midShoulderX, midShoulderY - 50);
            setNeckAngle(angle);
            const isBad = angle > BAD_ANGLE_THRESHOLD_DEG;
            notifyIfNeeded(isBad, angle);
            logEvent(isBad, angle);
          }
        }, DETECT_INTERVAL_MS);
      } catch (e) {
        setStatus('error');
      }
    };

    setup();
    return () => {
      isMounted = false;
      if (intervalId) window.clearInterval(intervalId);
      detectorRef.current = null;
    };
  }, [draw, logEvent, notifyIfNeeded, requestNotificationPermission]);

  return (
    <div className="grid gap-6">
      <Card title="Мониторинг осанки">
        <div className="flex items-center gap-4 mb-4">
          <span className="text-sm text-slate-600">Статус:</span>
          <span className={`text-sm font-medium ${status === 'running' ? 'text-green-600' : status === 'error' ? 'text-red-600' : ''}`}>{status}</span>
          <span className="ml-auto text-sm">Угол шеи: <span className="font-semibold">{neckAngle.toFixed(0)}°</span></span>
        </div>
        <div className="relative rounded-2xl overflow-hidden border border-slate-200" style={{ width: VIDEO_WIDTH, height: VIDEO_HEIGHT }}>
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
            style={{ position: 'absolute', left: 0, top: 0, width: VIDEO_WIDTH, height: VIDEO_HEIGHT }}
          />
        </div>
        <p className="text-xs text-slate-500 mt-3">
          Камера используется локально для анализа позы. На сервер отправляются только агрегированные события без изображения.
        </p>
      </Card>
    </div>
  );
};

export default PosturePage;
