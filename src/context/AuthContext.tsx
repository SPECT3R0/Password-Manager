import React, { createContext, useContext, useEffect, useState, useRef, ReactNode } from 'react';
import { AuthContextType, User } from '../types';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as firebaseSignOut, sendEmailVerification, updatePassword, User as FirebaseUser } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import { validateEmail, validatePassword as validatePasswordInput, sanitizeInput } from '../lib/validation';
import { securityService } from '../lib/security';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  changePassword: (newPassword: string) => Promise<void>;
  setup2FA: () => Promise<string>;
  verify2FA: (token: string) => Promise<void>;
  disable2FA: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

// Password validation function - keep as is
const validatePassword = (password: string): { isValid: boolean; message: string } => {
  if (password.length < 7) {
    return { isValid: false, message: 'Password must be at least 7 characters long' };
  }
  if (!/[A-Z]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one uppercase letter' };
  }
  if (!/[0-9]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one number' };
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return { isValid: false, message: 'Password must contain at least one special character' };
  }
  return { isValid: true, message: 'Password is valid' };
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const inactivityTimeout = useRef<NodeJS.Timeout | null>(null);

  // Listen for Firebase Auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Get user profile from Firestore
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);

        let userData = null;
        if (userDoc.exists()) {
          userData = userDoc.data();
        } else {
          // Create new user profile if missing
          await setDoc(userDocRef, {
            email: firebaseUser.email,
            two_factor_enabled: false,
            two_factor_secret: null,
            created_at: firebaseUser.metadata.creationTime || new Date().toISOString(),
          });
          userData = {
            email: firebaseUser.email,
            two_factor_enabled: false,
            two_factor_secret: null,
            created_at: firebaseUser.metadata.creationTime || new Date().toISOString(),
          };
        }

        setUser({
          id: firebaseUser.uid,
          email: firebaseUser.email!,
          created_at: userData.created_at,
          two_factor_enabled: userData.two_factor_enabled,
          two_factor_secret: userData.two_factor_secret || undefined,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Inactivity timer effect
  useEffect(() => {
    const resetTimer = () => {
      if (inactivityTimeout.current) clearTimeout(inactivityTimeout.current);
      inactivityTimeout.current = setTimeout(() => {
        signOut();
      }, 5 * 60 * 1000); // 5 minutes
    };
    // Listen for user activity
    window.addEventListener('mousemove', resetTimer);
    window.addEventListener('keydown', resetTimer);
    window.addEventListener('mousedown', resetTimer);
    window.addEventListener('touchstart', resetTimer);
    resetTimer();
    return () => {
      if (inactivityTimeout.current) clearTimeout(inactivityTimeout.current);
      window.removeEventListener('mousemove', resetTimer);
      window.removeEventListener('keydown', resetTimer);
      window.removeEventListener('mousedown', resetTimer);
      window.removeEventListener('touchstart', resetTimer);
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      
      // Validate input
      const emailValidation = validateEmail(email);
      if (!emailValidation.isValid) {
        throw new Error(emailValidation.errors[0]);
      }

      // Check login attempts
      const { allowed, remainingAttempts } = securityService.checkLoginAttempts(email);
      if (!allowed) {
        throw new Error(`Too many login attempts. Please try again in 15 minutes.`);
      }

      // Sanitize input
      const sanitizedEmail = sanitizeInput(email);
      
      // Attempt login
      await signInWithEmailAndPassword(auth, sanitizedEmail, password);
      
      // Log successful login
      await securityService.logLoginAttempt(sanitizedEmail, true);
    } catch (error: any) {
      // Log failed login attempt
      await securityService.logLoginAttempt(email, false);
      
      // Handle specific error cases
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        setError('Invalid email or password');
      } else if (error.code === 'auth/too-many-requests') {
        setError('Too many login attempts. Please try again later.');
      } else {
        setError('An error occurred during login');
      }
      throw error;
    }
  };

  const register = async (email: string, password: string) => {
    try {
      setError(null);
      
      // Validate input
      const emailValidation = validateEmail(email);
      const passwordValidation = validatePasswordInput(password);
      
      if (!emailValidation.isValid) {
        throw new Error(emailValidation.errors[0]);
      }
      
      if (!passwordValidation.isValid) {
        throw new Error(passwordValidation.errors[0]);
      }

      // Sanitize input
      const sanitizedEmail = sanitizeInput(email);
      
      // Create user
      const userCredential = await createUserWithEmailAndPassword(auth, sanitizedEmail, password);
      
      // Log successful registration
      await securityService.logSecurityEvent({
        type: 'login',
        details: 'New user registration',
      });
    } catch (error: any) {
      if (error.code === 'auth/email-already-in-use') {
        setError('Email is already registered');
      } else {
        setError('An error occurred during registration');
      }
      throw error;
    }
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
      await securityService.logSecurityEvent({
        type: 'login',
        details: 'User logged out',
      });
    } catch (error) {
      setError('An error occurred during logout');
      throw error;
    }
  };

  const changePassword = async (newPassword: string) => {
    try {
      if (!user) throw new Error('No user logged in');
      
      // Validate new password
      const passwordValidation = validatePasswordInput(newPassword);
      if (!passwordValidation.isValid) {
        throw new Error(passwordValidation.errors[0]);
      }

      const firebaseUser = auth.currentUser;
      if (!firebaseUser) throw new Error('No user logged in');

      await updatePassword(firebaseUser, newPassword);
      
      // Log password change
      await securityService.logPasswordChange(user.id);
    } catch (error: any) {
      setError('An error occurred while changing password');
      throw error;
    }
  };

  const setup2FA = async () => {
    if (!user) throw new Error('Not authenticated');

    const secret = authenticator.generateSecret();
    const otpauthUrl = authenticator.keyuri(user.email, 'VaultKeeper', secret);
    const qrCodeUrl = await QRCode.toDataURL(otpauthUrl);

    // Update Firestore user profile with secret (but 2FA not enabled yet)
    const userDocRef = doc(db, 'users', user.id);
    await updateDoc(userDocRef, { two_factor_secret: secret });

    // Update user state with secret
    setUser((u) => (u ? { ...u, two_factor_secret: secret } : null));

    return qrCodeUrl;
  };

  const verify2FA = async (token: string) => {
    if (!user?.two_factor_secret) throw new Error('2FA not set up');

    const isValid = authenticator.verify({
      token,
      secret: user.two_factor_secret,
    });

    if (!isValid) throw new Error('Invalid token');

    const userDocRef = doc(db, 'users', user.id);
    await updateDoc(userDocRef, { two_factor_enabled: true });

    setUser((u) => (u ? { ...u, two_factor_enabled: true } : null));
  };

  const disable2FA = async () => {
    if (!user) throw new Error('Not authenticated');

    const userDocRef = doc(db, 'users', user.id);
    await updateDoc(userDocRef, {
      two_factor_enabled: false,
      two_factor_secret: null,
    });

    setUser((u) =>
      u
        ? {
            ...u,
            two_factor_enabled: false,
            two_factor_secret: undefined,
          }
        : null
    );
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        changePassword,
        setup2FA,
        verify2FA,
        disable2FA,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
