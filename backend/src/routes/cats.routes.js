// backend/src/routes/cats.routes.js
import express from "express";
import {
  listCats,
  getCat,
  createCat,
  updateCat,
  deleteCat,
  adoptCat,
  listDeletedCats,
  restoreCat,
} from "../controllers/cat.controller.js";
import {
  importPreview,
  importConfirm,
} from "../controllers/catsImport.controller.js";
import {
  getAllAvailableCats,
  getPartnerFostersOnly,
  scrapePartnerFosters,
  getPartnerFostersInfo
} from "../controllers/shelterCats.controller.js";
import { requireAuth, requireAdmin } from "../middleware/auth.middleware.js";
import { uploadCsv } from "../middleware/upload.middleware.js";
import { exportCatsCsv } from "../controllers/catsExport.controller.js";

const router = express.Router();

// Public routes
router.get("/", listCats);
router.get("/all-available", getAllAvailableCats); // Featured + Partner fosters (deduplicated via view)
router.get("/partner-fosters", getPartnerFostersOnly); // Only partner fosters
router.get("/partner-fosters-info", getPartnerFostersInfo); // Partner foster database info
router.get("/:id", getCat);

// Admin routes
router.post("/", requireAuth, requireAdmin, createCat);
router.put("/:id", requireAuth, requireAdmin, updateCat);
router.delete("/:id", requireAuth, requireAdmin, deleteCat);
router.post("/:id/adopt", requireAuth, requireAdmin, adoptCat);

// Soft delete management (admin only)
router.get("/deleted/list", requireAuth, requireAdmin, listDeletedCats);
router.post("/:id/restore", requireAuth, requireAdmin, restoreCat);

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

// Partner foster management (admin only)
router.post("/scrape-partner-fosters", requireAuth, requireAdmin, scrapePartnerFosters);

export default router;
