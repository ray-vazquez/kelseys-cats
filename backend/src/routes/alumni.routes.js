import express from 'express';
import { listAlumni, getAlumni } from '../controllers/alumni.controller.js';

const router = express.Router();

router.get('/', listAlumni);
router.get('/:id', getAlumni);

export default router;
