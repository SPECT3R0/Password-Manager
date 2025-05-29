import { db } from './firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export interface SecurityLog {
  type: 'login' | 'login_failure' | 'password_change' | 'password_view' | 'password_copy';
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  details?: string;
  timestamp: Date;
}

class SecurityService {
  private static instance: SecurityService;
  private loginAttempts: Map<string, { count: number; lastAttempt: Date }> = new Map();
  private readonly MAX_LOGIN_ATTEMPTS = 5;
  private readonly LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

  private constructor() {}

  static getInstance(): SecurityService {
    if (!SecurityService.instance) {
      SecurityService.instance = new SecurityService();
    }
    return SecurityService.instance;
  }

  async logSecurityEvent(log: Omit<SecurityLog, 'timestamp'>): Promise<void> {
    try {
      await addDoc(collection(db, 'security_logs'), {
        ...log,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      // Log error without exposing details
      console.error('Failed to log security event');
    }
  }

  checkLoginAttempts(email: string): { allowed: boolean; remainingAttempts: number } {
    const now = new Date();
    const attempt = this.loginAttempts.get(email);

    if (!attempt) {
      return { allowed: true, remainingAttempts: this.MAX_LOGIN_ATTEMPTS };
    }

    // Check if lockout period has expired
    if (now.getTime() - attempt.lastAttempt.getTime() > this.LOCKOUT_DURATION) {
      this.loginAttempts.delete(email);
      return { allowed: true, remainingAttempts: this.MAX_LOGIN_ATTEMPTS };
    }

    const remainingAttempts = Math.max(0, this.MAX_LOGIN_ATTEMPTS - attempt.count);
    return {
      allowed: remainingAttempts > 0,
      remainingAttempts
    };
  }

  recordLoginAttempt(email: string, success: boolean): void {
    const now = new Date();
    const attempt = this.loginAttempts.get(email) || { count: 0, lastAttempt: now };

    if (success) {
      this.loginAttempts.delete(email);
    } else {
      this.loginAttempts.set(email, {
        count: attempt.count + 1,
        lastAttempt: now
      });
    }
  }

  async logLoginAttempt(email: string, success: boolean, ipAddress?: string, userAgent?: string): Promise<void> {
    this.recordLoginAttempt(email, success);
    
    await this.logSecurityEvent({
      type: success ? 'login' : 'login_failure',
      details: success ? 'Successful login' : 'Failed login attempt',
      ipAddress,
      userAgent
    });
  }

  async logPasswordChange(userId: string, ipAddress?: string, userAgent?: string): Promise<void> {
    await this.logSecurityEvent({
      type: 'password_change',
      userId,
      details: 'Password changed',
      ipAddress,
      userAgent
    });
  }

  async logPasswordView(userId: string, passwordId: string, ipAddress?: string, userAgent?: string): Promise<void> {
    await this.logSecurityEvent({
      type: 'password_view',
      userId,
      details: `Viewed password ${passwordId}`,
      ipAddress,
      userAgent
    });
  }

  async logPasswordCopy(userId: string, passwordId: string, ipAddress?: string, userAgent?: string): Promise<void> {
    await this.logSecurityEvent({
      type: 'password_copy',
      userId,
      details: `Copied password ${passwordId}`,
      ipAddress,
      userAgent
    });
  }
}

export const securityService = SecurityService.getInstance(); 