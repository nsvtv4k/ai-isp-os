import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { AuthenticatedRequest } from './tenantIsolation.js';
import { User } from '../models/User.js';

const JWT_SECRET = process.env.JWT_SECRET || 'ai-isp-os-master-enterprise-secret-key-2026';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  tenantId?: string;
  permissions: string[];
  sessionId?: string;
}

export const generateToken = (payload: TokenPayload, expiresIn: any = '8h'): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn } as any);
};

export const authenticateToken = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Authentication token required. Please sign in.',
      });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;

    // Gracefully handle dev tokens or offline database
    let user: any = null;
    try {
      if (decoded.userId && mongoose.Types.ObjectId.isValid(decoded.userId)) {
        user = await User.findById(decoded.userId);
      }
    } catch {
      // Database offline or query failed
    }

    if (!user && (decoded.userId?.startsWith('dev_') || process.env.NODE_ENV !== 'production')) {
      req.user = {
        id: decoded.userId || 'dev_superadmin_01',
        email: decoded.email || 'admin@isp.local',
        role: decoded.role || 'super_admin',
        tenantId: decoded.tenantId,
        permissions: decoded.permissions || ['SUPERADMIN_ALL', 'CUSTOMER_ALL', 'DEVICE_ALL', 'GIS_ALL', 'AI_ALL', 'TECH_ALL'],
      };
      if (!req.tenantId && decoded.tenantId) {
        req.tenantId = decoded.tenantId;
      }
      return next();
    }

    if (!user || user.status !== 'active') {
      return res.status(401).json({
        success: false,
        error: 'Session expired or user account is deactivated.',
      });
    }

    req.user = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      tenantId: user.tenantId?.toString(),
      permissions: user.permissions || [],
    };

    if (!req.tenantId && user.tenantId) {
      req.tenantId = user.tenantId.toString();
    }

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired authentication token.',
    });
  }
};
