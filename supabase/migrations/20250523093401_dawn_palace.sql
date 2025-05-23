/*
  # Add Two-Factor Authentication Support
  
  1. New Tables
    - `two_factor_auth`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `secret` (text, stores TOTP secret)
      - `enabled` (boolean, indicates if 2FA is enabled)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
  
  2. Security
    - Enable RLS on `two_factor_auth` table
    - Add policies for users to manage their own 2FA settings
*/

-- Create the two_factor_auth table
CREATE TABLE IF NOT EXISTS two_factor_auth (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  secret text,
  enabled boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE two_factor_auth ENABLE ROW LEVEL SECURITY;

-- Create policies for the two_factor_auth table
CREATE POLICY "Users can view their own 2FA settings"
  ON two_factor_auth
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own 2FA settings"
  ON two_factor_auth
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own 2FA settings"
  ON two_factor_auth
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create trigger for updating the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER two_factor_auth_updated_at
  BEFORE UPDATE ON two_factor_auth
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();