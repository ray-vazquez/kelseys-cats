import { AuthService } from '../services/AuthService.js';

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
