export interface User {
  id: string;
  email: string;
  created_at: string;
  two_factor_secret?: string;
  two_factor_enabled: boolean;
}

export interface Password {
  id: string;
  user_id: string;
  website: string;
  username: string;
  encrypted_password: string;
  created_at: string;
  updated_at: string;
  website_icon?: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string, token?: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<{ success: boolean; message: string }>;
  signOut: () => Promise<void>;
  setup2FA: () => Promise<string>;
  verify2FA: (token: string) => Promise<void>;
  disable2FA: () => Promise<void>;
}

export interface PasswordContextType {
  passwords: Password[];
  loading: boolean;
  addPassword: (data: Omit<Password, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => Promise<void>;
  updatePassword: (id: string, data: Partial<Password>) => Promise<void>;
  deletePassword: (id: string) => Promise<void>;
  getPasswords: () => Promise<void>;
}

export interface ThemeContextType {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}