import { query } from '../lib/db.js';

export class AdminUserModel {
  static async findByEmail(email) {
    const [rows] = await query('SELECT * FROM admin_users WHERE email = ?', [email]);
    return rows[0] || null;
  }

  static async create({ email, password_hash, role = 'admin' }) {
    const [result] = await query(
      'INSERT INTO admin_users (email, password_hash, role) VALUES (?, ?, ?)',
      [email, password_hash, role]
    );
    const [rows] = await query('SELECT * FROM admin_users WHERE id = ?', [result.insertId]);
    return rows[0];
  }
}
