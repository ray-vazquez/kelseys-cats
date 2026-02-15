import { query } from '../lib/db.js';

export class AdminUserModel {
  static async findByEmail(emailOrUsername) {
    // Check admin_users table with email column
    const [rows] = await query('SELECT * FROM admin_users WHERE email = ?', [emailOrUsername]);
    return rows[0] || null;
  }

  static async create({ email, username, password_hash, role = 'admin' }) {
    // Use email (admin_users table schema)
    const userEmail = email || username;
    const [result] = await query(
      'INSERT INTO admin_users (email, password_hash, role) VALUES (?, ?, ?)',
      [userEmail, password_hash, role]
    );
    const [rows] = await query('SELECT * FROM admin_users WHERE id = ?', [result.insertId]);
    return rows[0];
  }

  static async findById(id) {
    const [rows] = await query('SELECT * FROM admin_users WHERE id = ?', [id]);
    return rows[0] || null;
  }
}
