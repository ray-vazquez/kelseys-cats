import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './src/config/env.js';
import catsRouter from './src/routes/cats.routes.js';
import alumniRouter from './src/routes/alumni.routes.js';
import authRouter from './src/routes/auth.routes.js';
import scraperRouter from './src/routes/scraper.routes.js';
import uploadRouter from './src/routes/upload.routes.js';
import { errorHandler } from './src/middleware/error.middleware.js';
import { loginRateLimiter } from './src/middleware/rateLimit.middleware.js';
import { initCronJobs } from './src/services/cronService.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: env.FRONTEND_ORIGIN, credentials: true }));
app.use(express.json());

// Public routes
app.use('/api/auth', loginRateLimiter, authRouter);
app.use('/api/cats', catsRouter);
app.use('/api/alumni', alumniRouter);

// Admin routes
app.use('/api/upload', uploadRouter);
app.use('/api/admin/scrape', scraperRouter);

// Error handler (must be last)
app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`🚀 API listening on port ${env.PORT}`);
  console.log(`🐈 Cats API ready!`);
  console.log(`🌍 CORS enabled for: ${env.FRONTEND_ORIGIN}`);
  
  // Initialize cron jobs for automated scraping
  initCronJobs();
});
