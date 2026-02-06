import { AuthService } from '../services/AuthService.js';

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await AuthService.login(email, password);
    if (!result) return res.status(401).json({ error: 'Invalid credentials' });
    res.json(result);
  } catch (err) {
    next(err);
  }
}
