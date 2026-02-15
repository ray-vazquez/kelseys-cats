import { AuthService } from '../services/AuthService.js';
import bcrypt from 'bcrypt';
import { query } from '../lib/db.js';

export async function login(req, res, next) {
  try {
    const { email, username, password } = req.body;
    // Accept either email or username
    const loginIdentifier = email || username;
    const result = await AuthService.login(loginIdentifier, password);
    if (!result) return res.status(401).json({ error: 'Invalid credentials' });
    res.json(result);
  } catch (err) {
    next(err);
  }
}

export async function resetPassword(req, res, next) {
  try {
    const { username, currentPassword, newPassword, adminSecret } = req.body;

    // Require admin secret for security (set in .env as ADMIN_RESET_SECRET)
    const expectedSecret = process.env.ADMIN_RESET_SECRET || 'kelseyscats2026';
    
    if (adminSecret !== expectedSecret) {
      return res.status(403).json({ error: 'Invalid admin secret' });
    }

    if (!username || !newPassword) {
      return res.status(400).json({ error: 'Username and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Get user
    const [users] = await query('SELECT * FROM admin_users WHERE username = ?', [username]);
    
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = users[0];

    // If currentPassword provided, verify it first
    if (currentPassword) {
      const validPassword = await bcrypt.compare(currentPassword, user.password_hash);
      if (!validPassword) {
        return res.status(401).json({ error: 'Current password is incorrect' });
      }
    }

    // Hash new password
    const password_hash = await bcrypt.hash(newPassword, 10);

    // Update password
    await query(
      'UPDATE admin_users SET password_hash = ?, updated_at = NOW() WHERE id = ?',
      [password_hash, user.id]
    );

    res.json({ 
      success: true, 
      message: 'Password reset successfully',
      username: user.username 
    });
  } catch (err) {
    next(err);
  }
}
