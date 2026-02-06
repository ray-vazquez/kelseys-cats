import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AdminUserModel } from "../models/AdminUserModel.js";
import { env } from "../config/env.js";

export class AuthService {
  static async login(email, password) {
    const user = await AdminUserModel.findByEmail(email);
    if (!user) return null;

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return null;

    const payload = { sub: user.id, role: user.role };
    const token = jwt.sign(payload, env.JWT_SECRET, { expiresIn: "8h" });
    return { token, user: { id: user.id, email: user.email, role: user.role } };
  }

  static verifyToken(token) {
    try {
      return jwt.verify(token, env.JWT_SECRET);
    } catch (e) {
      return null;
    }
  }
}
