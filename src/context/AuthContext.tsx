import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { AuthContextType, User } from '../types';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as firebaseSignOut, sendEmailVerification } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { authenticator } from 'otplib';
import QRCode from 'qrcode';

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

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
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

  const signIn = async (email: string, password: string, token?: string) => {
    try {
      // Sign in with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      if (!firebaseUser) throw new Error('No user found in authentication system.');

      // Get user profile
      const userDocRef = doc(db, 'users', firebaseUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) throw new Error('User profile not found.');

      const userData = userDoc.data();

      // Check 2FA if enabled
      if (userData?.two_factor_enabled) {
        if (!token) {
          throw new Error('2FA_REQUIRED');
        }
        const isValid = authenticator.verify({
          token,
          secret: userData.two_factor_secret,
        });
        if (!isValid) {
          throw new Error('Invalid 2FA token');
        }
      }

      // Set user context
      setUser({
        id: firebaseUser.uid,
        email: firebaseUser.email!,
        created_at: userData.created_at,
        two_factor_secret: userData.two_factor_secret || undefined,
        two_factor_enabled: userData.two_factor_enabled,
      });
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : 'Unexpected error during sign in');
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      // Validate password
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.isValid) {
        throw new Error(passwordValidation.message);
      }

      // Check if email already exists - Firebase does this inherently but optional to check in Firestore
      // (If needed, could query Firestore, but Firebase Auth signUp will error on duplicate anyway)

      // Create user with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      if (!firebaseUser) throw new Error('Failed to create user account');

      // Create user profile in Firestore
      await setDoc(doc(db, 'users', firebaseUser.uid), {
        email,
        two_factor_enabled: false,
        two_factor_secret: null,
        created_at: firebaseUser.metadata.creationTime || new Date().toISOString(),
      });

      // Optionally, send email verification
      if (firebaseUser.email) {
        await sendEmailVerification(firebaseUser);
      }

      return { success: true, message: 'Account created successfully! Please check your email to verify your account.' };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
      };
    }
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setUser(null);
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
        signIn,
        signUp,
        signOut,
        setup2FA,
        verify2FA,
        disable2FA,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
