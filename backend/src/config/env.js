import { config } from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env from backend root
config({ path: join(__dirname, "..", "..", ".env") });

export const env = {
  // Server
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || "development",
  FRONTEND_ORIGIN: process.env.FRONTEND_ORIGIN || "http://localhost:5173",

  // Database
  DB_URL: process.env.DB_URL || "mysql://root:root@localhost:3306/kelseys_cats",
  DB_HOST: "http://localhost:3000",
  DB_USER: "root",
  DB_PASSWORD: "root",
  DB_NAME: "kelseys_cats",

  // Authentication
  JWT_SECRET:
    process.env.JWT_SECRET || "zJEsrgJB/aIZxsQV721Uuz4rweyXXqt6RydTHl0IcFc=",

  // Cloudinary (Image Hosting)
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || "dwf4m7loy",
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || "387546713819419",
  CLOUDINARY_API_SECRET:
    process.env.CLOUDINARY_API_SECRET || "v3wjPHVwqbk6dotSMGEkztGl6K8",
};

// Validate required environment variables
function validateEnv() {
  const required = ["DB_URL", "JWT_SECRET"];
  const missing = required.filter(
    (key) => !env[key] || env[key].includes("change_this"),
  );

  if (missing.length > 0) {
    console.warn(
      "⚠️  Missing or default environment variables:",
      missing.join(", "),
    );
    console.warn("   Configure these in backend/.env for production\n");
  }

  // Warn about Cloudinary if not configured
  if (!env.CLOUDINARY_CLOUD_NAME) {
    console.warn("⚠️  Cloudinary not configured - image uploads will fail");
    console.warn("   Add CLOUDINARY_* variables to backend/.env\n");
  }
}

if (env.NODE_ENV !== "test") {
  validateEnv();
}
