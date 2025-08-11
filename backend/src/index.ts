import express, { Request, Response } from 'express';
import cors from 'cors';
import morgan from 'morgan';

type PostureEvent = {
  timestamp: number;
  status: 'good' | 'bad';
  metric?: {
    neckAngleDeg?: number;
  };
};

type BlinkEvent = {
  timestamp: number;
  blinksPerMin?: number;
};

const app = express();
const port = Number(process.env.PORT || 4000);

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

const postureEvents: PostureEvent[] = [];
const blinkEvents: BlinkEvent[] = [];

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ ok: true, service: 'posture-backend', time: Date.now() });
});

app.post('/api/posture', (req: Request, res: Response) => {
  const event = req.body as Partial<PostureEvent>;
  if (!event || (event.status !== 'good' && event.status !== 'bad')) {
    return res.status(400).json({ error: 'invalid event' });
  }
  const normalized: PostureEvent = {
    timestamp: Date.now(),
    status: event.status,
    metric: event.metric,
  };
  postureEvents.push(normalized);
  if (postureEvents.length > 5000) postureEvents.shift();
  res.status(201).json({ ok: true });
});

app.get('/api/posture-events', (_req: Request, res: Response) => {
  res.json({ events: postureEvents });
});

app.post('/api/blink-events', (req: Request, res: Response) => {
  const { blinksPerMin } = req.body || {};
  const event: BlinkEvent = { timestamp: Date.now(), blinksPerMin };
  blinkEvents.push(event);
  if (blinkEvents.length > 5000) blinkEvents.shift();
  res.status(201).json({ ok: true });
});

app.get('/api/blink-events', (_req: Request, res: Response) => {
  res.json({ events: blinkEvents });
});

app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Backend listening on http://localhost:${port}`);
});


