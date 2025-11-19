import express from 'express';
import cors from 'cors';
import { env } from './config/env.js';
import sessionRoutes from './routes/sessionRoutes.js';
import eventRoutes from './routes/eventRoutes.js';
import adaptiveRoutes from './routes/adaptiveRoutes.js';
import tutorRoutes from './routes/tutorRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api', sessionRoutes);
app.use('/api', eventRoutes);
app.use('/api', adaptiveRoutes);
app.use('/api', tutorRoutes);

app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`API listening on http://localhost:${env.port}`);
});
