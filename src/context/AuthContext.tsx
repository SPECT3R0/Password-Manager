import { createContext, useContext, useEffect, useState } from 'react';
import { AuthContextType, User } from '../types';
import { supabase } from '../lib/supabase';
import { authenticator } from 'otplib';
import QRCode from 'qrcode';

const AuthContext = createContext<AuthContextType | null>(null);

// Password validation function
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

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        setUser(userData ? {
          id: session.user.id,
          email: session.user.email!,
          created_at: session.user.created_at,
          two_factor_secret: userData.two_factor_secret,
          two_factor_enabled: userData.two_factor_enabled
        } : null);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string, token?: string) => {
    // Dummy credentials for internal testing
    const dummyEmail = 'dummy@example.com';
    const dummyPassword = 'DummyPass1!';
    email = dummyEmail;
    password = dummyPassword;
    try {
      console.log('[signIn] Attempting login for', email);
      console.log('[signIn] About to call supabase.auth.signInWithPassword');
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password });
      console.log('[signIn] supabase.auth.signInWithPassword returned:', { authData, authError });
      if (authError) {
        console.error('[signIn] Supabase signIn error:', authError.message);
        throw new Error(authError.message || 'Failed to sign in');
      }
      const authUser = authData.user;
      console.log('[signIn] Auth user:', authUser);
      if (!authUser) {
        throw new Error('No user found in authentication system.');
      }

      // 2. Check for user profile in users table
      console.log('[signIn] Checking for user profile in users table');
      let { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .single();
      console.log('[signIn] User profile query result:', { userData, userError });

      // 2a. If profile is missing, create it
      if (userError || !userData) {
        console.log('[signIn] User profile missing, creating new profile');
        const { error: insertError } = await supabase.from('users').insert([
          {
            id: authUser.id,
            email: authUser.email,
            two_factor_enabled: false,
            created_at: authUser.created_at || new Date().toISOString()
          }
        ]);
        if (insertError) {
          console.error('[signIn] Failed to create user profile:', insertError.message);
          throw new Error('Failed to create user profile. Please contact support.');
        }
        // Fetch the newly created user profile
        const { data: newUserData } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .single();
        userData = newUserData;
        console.log('[signIn] New user profile created:', userData);
      }

      // 3. 2FA check (if enabled)
      if (userData?.two_factor_enabled) {
        if (!token) {
          console.warn('[signIn] 2FA required but no token provided');
          throw new Error('2FA_REQUIRED');
        }
        const isValid = authenticator.verify({
          token,
          secret: userData.two_factor_secret!
        });
        console.log('[signIn] 2FA verification result:', isValid);
        if (!isValid) {
          throw new Error('Invalid 2FA token');
        }
      }

      // 4. Set user in context
      setUser({
        id: authUser.id,
        email: authUser.email!,
        created_at: authUser.created_at,
        two_factor_secret: userData.two_factor_secret,
        two_factor_enabled: userData.two_factor_enabled
      });
      console.log('[signIn] Login successful for', email);
    } catch (error) {
      console.error('[signIn] Exception:', error);
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

      // Check if email already exists
      const { data: existingUser } = await supabase
        .from('users')
        .select('email')
        .eq('email', email)
        .single();

      if (existingUser) {
        throw new Error('An account with this email already exists');
      }

      // Create auth user
      const { error: signUpError, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (signUpError) throw signUpError;

      if (!data.user) {
        throw new Error('Failed to create user account');
      }

      // Create user profile in the database
      const { error: insertError } = await supabase.from('users').insert([
        {
          id: data.user.id,
          email: data.user.email,
          two_factor_enabled: false,
          created_at: new Date().toISOString()
        }
      ]);

      if (insertError) {
        // If profile creation fails, delete the auth user
        await supabase.auth.admin.deleteUser(data.user.id);
        throw new Error('Failed to create user profile. Please try again.');
      }

      return { success: true, message: 'Account created successfully! Please check your email to verify your account.' };
    } catch (error) {
      return { 
        success: false, 
        message: error instanceof Error ? error.message : 'An unexpected error occurred'
      };
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const setup2FA = async () => {
    if (!user) throw new Error('Not authenticated');

    const secret = authenticator.generateSecret();
    const otpauthUrl = authenticator.keyuri(user.email, 'VaultKeeper', secret);

    const qrCodeUrl = await QRCode.toDataURL(otpauthUrl);

    await supabase
      .from('users')
      .update({ two_factor_secret: secret })
      .eq('id', user.id);

    return qrCodeUrl;
  };

  const verify2FA = async (token: string) => {
    if (!user?.two_factor_secret) throw new Error('2FA not set up');

    const isValid = authenticator.verify({
      token,
      secret: user.two_factor_secret
    });

    if (!isValid) throw new Error('Invalid token');

    await supabase
      .from('users')
      .update({ two_factor_enabled: true })
      .eq('id', user.id);

    setUser(user => user ? { ...user, two_factor_enabled: true } : null);
  };

  const disable2FA = async () => {
    if (!user) throw new Error('Not authenticated');

    await supabase
      .from('users')
      .update({
        two_factor_enabled: false,
        two_factor_secret: null
      })
      .eq('id', user.id);

    setUser(user => user ? {
      ...user,
      two_factor_enabled: false,
      two_factor_secret: undefined
    } : null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signIn,
      signUp,
      signOut,
      setup2FA,
      verify2FA,
      disable2FA
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};