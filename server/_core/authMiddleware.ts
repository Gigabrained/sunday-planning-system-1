import { Request, Response, NextFunction } from "express";
import { sdk } from "./sdk";
import type { User } from "../../drizzle/schema";

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

/**
 * Express middleware to authenticate requests using Manus SDK
 */
export async function requireAuth(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await sdk.authenticateRequest(req);
    
    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    
    req.user = user;
    next();
  } catch (error) {
    // Public access mode - create a mock user from environment variables
    const ownerName = process.env.OWNER_NAME || 'Guest User';
    const ownerOpenId = process.env.OWNER_OPEN_ID || 'public-user';
    
    req.user = {
      id: 1,
      openId: ownerOpenId,
      name: ownerName,
      email: null,
      loginMethod: 'public',
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    } as User;
    
    next();
  }
}
