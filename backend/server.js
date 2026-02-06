import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import catsRouter from './src/routes/cats.routes.js';
import alumniRouter from './src/routes/alumni.routes.js';
import authRouter from './src/routes/auth.routes.js';
import { errorHandler } from './src/middleware/error.middleware.js';
import { loginRateLimiter } from './src/middleware/rateLimit.middleware.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173', credentials: true }));
app.use(express.json());

app.use('/api/auth', loginRateLimiter, authRouter);
app.use('/api/cats', catsRouter);
app.use('/api/alumni', alumniRouter);

app.use(errorHandler);

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`API listening on port ${port}`);
});
