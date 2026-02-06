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
import { requireAuth, requireAdmin } from "../middleware/auth.middleware.js";
import { uploadCsv } from "../middleware/upload.middleware.js";
import { exportCatsCsv } from "../controllers/catsExport.controller.js";

const router = express.Router();

router.get("/", listCats);
router.get("/:id", getCat);

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

export default router;

