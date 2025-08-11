import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Webcam from 'react-webcam';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';
import * as faceLandmarksDetection from '@tensorflow-models/face-landmarks-detection';

const VIDEO_WIDTH = 480;
const VIDEO_HEIGHT = 360;
const SAMPLE_MS = 150; // ~6-7 Гц достаточно
const WINDOW_SEC = 60; // окно усреднения по минуте

function computeEAR(eye: Array<{ x: number; y: number }>) {
  // EAR (Eye Aspect Ratio) по шести точкам глаза: (p2-p6 + p3-p5) / (2 * p1-p4)
  // Для упрощения возьмём медианные пары по верхним/нижним векам
  const dist = (a: any, b: any) => Math.hypot(a.x - b.x, a.y - b.y);
  const vertical = dist(eye[1], eye[5]) + dist(eye[2], eye[4]);
  const horizontal = 2 * dist(eye[0], eye[3]);
  if (horizontal === 0) return 0;
  return vertical / horizontal;
}

export const BlinkMonitor: React.FC = () => {
  const webcamRef = useRef<Webcam | null>(null);
  const detectorRef = useRef<faceLandmarksDetection.FaceLandmarksDetector | null>(null);
  const [ear, setEar] = useState(0);
  const [blinksPerMin, setBlinksPerMin] = useState(0);
  const [isClosed, setIsClosed] = useState(false);
  const [status, setStatus] = useState<'idle' | 'running' | 'error'>('idle');

  const videoConstraints = useMemo(
    () => ({ width: VIDEO_WIDTH, height: VIDEO_HEIGHT, facingMode: 'user' as const }),
    []
  );

  useEffect(() => {
    let intervalId: number | null = null;
    let windowTicks: number[] = [];
    let blinkCount = 0;

    const setup = async () => {
      try {
        await tf.setBackend('webgl');
        await tf.ready();
        const detector = await faceLandmarksDetection.createDetector(
          faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh,
          {
            runtime: 'mediapipe',
            refineLandmarks: true,
            solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh',
          } as faceLandmarksDetection.MediaPipeFaceMeshMediaPipeModelConfig
        );
        detectorRef.current = detector;
        setStatus('running');

        intervalId = window.setInterval(async () => {
          const webcam = webcamRef.current;
          if (!webcam || !webcam.video) return;
          const video = webcam.video as HTMLVideoElement;
          if (video.readyState < 2) return;
          const faces = await detector.estimateFaces(video, { flipHorizontal: true });
          const face = faces?.[0];
          if (!face || !face.keypoints) return;

          // Индексы глаз в MediaPipe FaceMesh
          const leftIdx = [33, 160, 158, 133, 153, 144];
          const rightIdx = [362, 385, 387, 263, 373, 380];
          const pts = face.keypoints as Array<{ x: number; y: number; z?: number; name?: string }>;
          const leftEye = leftIdx.map((i) => ({ x: pts[i].x, y: pts[i].y }));
          const rightEye = rightIdx.map((i) => ({ x: pts[i].x, y: pts[i].y }));
          const earLeft = computeEAR(leftEye);
          const earRight = computeEAR(rightEye);
          const earAvg = (earLeft + earRight) / 2;
          setEar(earAvg);

          const CLOSED_THR = 0.22; // эмпирический порог закрытия
          const now = Date.now();

          if (earAvg < CLOSED_THR && !isClosed) {
            setIsClosed(true);
          }
          if (earAvg >= CLOSED_THR && isClosed) {
            setIsClosed(false);
            blinkCount += 1;
          }

          windowTicks.push(now);
          // чистка окна 60 сек
          windowTicks = windowTicks.filter((t) => now - t <= WINDOW_SEC * 1000);
          const bpm = (blinkCount / Math.max(1, (windowTicks.length * SAMPLE_MS) / 60000));
          setBlinksPerMin(Math.round(bpm));

          // отправка события раз в ~5 секунд
          if (now % 5000 < SAMPLE_MS) {
            fetch('/api/blink-events', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ blinksPerMin: Math.round(bpm) }),
            }).catch(() => void 0);
          }
        }, SAMPLE_MS);
      } catch (e) {
        setStatus('error');
      }
    };

    setup();
    return () => {
      if (intervalId) window.clearInterval(intervalId);
      detectorRef.current = null;
    };
  }, [isClosed]);

  return (
    <div className="grid gap-3">
      <div className="text-sm">Статус: {status}</div>
      <div className="text-sm">EAR: {ear.toFixed(3)} | Морг/мин: {blinksPerMin}</div>
      <div className="relative rounded-2xl overflow-hidden border border-slate-200" style={{ width: VIDEO_WIDTH, height: VIDEO_HEIGHT }}>
        <Webcam ref={webcamRef} audio={false} mirrored videoConstraints={videoConstraints} style={{ width: VIDEO_WIDTH, height: VIDEO_HEIGHT }} />
      </div>
    </div>
  );
};


