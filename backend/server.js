import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
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
app.use(cors({ origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173', credentials: true }));
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

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`🚀 API listening on port ${port}`);
  console.log(`🐈 Cats API ready!`);
  
  // Initialize cron jobs for automated scraping
  initCronJobs();
});
