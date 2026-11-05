import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { db } from './db.js';

export const JWT_SECRET = process.env.JWT_SECRET || 'academia_super_secret_jwt_key_2026_bca_aids';

export interface AuthUser {
  id: string;
  roll_number: string;
  full_name: string;
  course: string;
  global_target: number;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthUser;
}

export function generateToken(user: AuthUser): string {
  return jwt.sign(
    {
      id: user.id,
      roll_number: user.roll_number,
      full_name: user.full_name,
      course: user.course,
      global_target: user.global_target,
    },
    JWT_SECRET,
    { expiresIn: '30d' }
  );
}

export function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required. Please log in.' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthUser;
    
    // Verify user still exists in database
    const userRow = db.prepare('SELECT id, roll_number, full_name, course, global_target FROM profiles WHERE id = ?').get(decoded.id) as AuthUser | undefined;
    if (!userRow) {
      res.status(401).json({
        error: 'User profile no longer in database. Rehydrating session...',
        code: 'PROFILE_NOT_IN_DB',
        roll_number: decoded.roll_number,
      });
      return;
    }

    req.user = userRow;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired session token. Please log in again.' });
  }
}
