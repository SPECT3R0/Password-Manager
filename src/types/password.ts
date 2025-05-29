export interface Password {
  id: string;
  title: string;
  username: string;
  password: string;
  website?: string;
  notes?: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface PasswordState {
  passwords: Password[];
  isLoading: boolean;
  error: string | null;
} 