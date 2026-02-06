import { AuthService } from "../services/AuthService.js";

export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  // console.log("Auth Token:", token); // Debugging line
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  const payload = AuthService.verifyToken(token);
  if (!payload) return res.status(401).json({ error: "Invalid token" });

  req.user = payload;
  next();
}

export function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ error: "Forbidden" });
  }
  next();
}
