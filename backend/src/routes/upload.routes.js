import express from 'express';
import multer from 'multer';
import { uploadImage } from '../controllers/upload.controller.js';
import { requireAuth } from '../middleware/auth.middleware.js';

const router = express.Router();

// Configure multer for memory storage (no disk writes)
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// POST /api/upload/image - Upload single image
router.post('/image', requireAuth, upload.single('image'), uploadImage);

export default router;
