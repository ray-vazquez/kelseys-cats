import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Image uploads ---
const imageUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error("Only image files (JPEG, PNG, WEBP) are allowed"));
  },
});

// --- CSV uploads ---
const csvUpload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 2 * 1024 * 1024, // 2 MB
  },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const allowedMimes = [
      "text/csv",
      "application/vnd.ms-excel",
      "application/csv",
    ];

    if (ext === ".csv" || allowedMimes.includes(file.mimetype)) {
      return cb(null, true);
    }
    cb(new Error("Only CSV files are allowed"));
  },
});

// CSV import (single file)
export const uploadCsv = csvUpload.single("file");

// Upload multiple cat images (max 10)
export const uploadCatImages = imageUpload.array("images", 10);

// Upload single main cat image
export const uploadSingleImage = imageUpload.single("image");
