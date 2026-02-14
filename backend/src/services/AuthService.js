import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AdminUserModel } from "../models/AdminUserModel.js";
import { env } from "../config/env.js";

export class AuthService {
  static async login(usernameOrEmail, password) {
    // Validate inputs
    if (!usernameOrEmail || !password) {
      return null;
    }

    const user = await AdminUserModel.findByEmail(usernameOrEmail);
    if (!user) return null;

    // Validate password_hash exists
    if (!user.password_hash) {
      console.error(`User ${usernameOrEmail} has no password_hash in database`);
      return null;
    }

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return null;

    const payload = { sub: user.id, role: user.role };
    const token = jwt.sign(payload, env.JWT_SECRET, { expiresIn: "8h" });
    return { 
      token, 
      user: { 
        id: user.id, 
        username: user.username, 
        role: user.role 
      } 
    };
  }

  static verifyToken(token) {
    try {
      return jwt.verify(token, env.JWT_SECRET);
    } catch (e) {
      return null;
    }
  }
}
