// backend/src/routes/tags.routes.js
// Routes for tag management and cat tag associations

import express from 'express';
import {
  getAllTags,
  getTagCategories,
  createTag,
  getCatTags,
  updateCatTags
} from '../controllers/tags.controller.js';

const router = express.Router();

// Tag management endpoints
router.get('/', getAllTags);                    // GET /api/tags?category=temperament
router.get('/categories', getTagCategories);    // GET /api/tags/categories
router.post('/', createTag);                    // POST /api/tags (admin only - add middleware later)

// Cat-specific tag endpoints
router.get('/cats/:id', getCatTags);            // GET /api/tags/cats/:id
router.put('/cats/:id', updateCatTags);         // PUT /api/tags/cats/:id (admin only)




export default router;
