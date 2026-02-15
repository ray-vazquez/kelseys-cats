import { query } from '../lib/db.js';

export class AdminUserModel {
  static async findByEmail(usernameOrEmail) {
    // Check admin_users table with username column
    const [rows] = await query('SELECT * FROM admin_users WHERE username = ?', [usernameOrEmail]);
    return rows[0] || null;
  }

  static async create({ email, username, password_hash, role = 'admin' }) {
    // Use username (admin_users table schema)
    const user = username || email;
    const [result] = await query(
      'INSERT INTO admin_users (username, password_hash, role) VALUES (?, ?, ?)',
      [user, password_hash, role]
    );
    const [rows] = await query('SELECT * FROM admin_users WHERE id = ?', [result.insertId]);
    return rows[0];
  }

  static async findById(id) {
    const [rows] = await query('SELECT * FROM admin_users WHERE id = ?', [id]);
    return rows[0] || null;
  }
}
