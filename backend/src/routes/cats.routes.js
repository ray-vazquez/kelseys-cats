// backend/src/routes/cats.routes.js
import express from "express";
import {
  listCats,
  getCat,
  createCat,
  updateCat,
  deleteCat,
  adoptCat,
} from "../controllers/cat.controller.js";
import {
  importPreview,
  importConfirm,
} from "../controllers/catsImport.controller.js";
import {
  getAllAvailableCats,
  getShelterCatsOnly,
  refreshCache,
  getCacheStatus
} from "../controllers/shelterCats.controller.js";
import { requireAuth, requireAdmin } from "../middleware/auth.middleware.js";
import { uploadCsv } from "../middleware/upload.middleware.js";
import { exportCatsCsv } from "../controllers/catsExport.controller.js";

const router = express.Router();

// Public routes
router.get("/", listCats);
router.get("/all-available", getAllAvailableCats); // NEW: Foster + Shelter cats (deduplicated)
router.get("/shelter", getShelterCatsOnly); // NEW: Only shelter cats
router.get("/:id", getCat);

// Admin routes
router.post("/", requireAuth, requireAdmin, createCat);
router.put("/:id", requireAuth, requireAdmin, updateCat);
router.delete("/:id", requireAuth, requireAdmin, deleteCat);
router.post("/:id/adopt", requireAuth, requireAdmin, adoptCat);

// CSV import
router.post(
  "/import/preview",
  requireAuth,
  requireAdmin,
  uploadCsv,
  importPreview,
);

router.post("/import/confirm", requireAuth, requireAdmin, importConfirm);
router.get("/export/csv", requireAuth, requireAdmin, exportCatsCsv);

// Cache management (admin only)
router.post("/refresh-cache", requireAuth, requireAdmin, refreshCache);
router.get("/cache-info", requireAuth, requireAdmin, getCacheStatus);

export default router;
