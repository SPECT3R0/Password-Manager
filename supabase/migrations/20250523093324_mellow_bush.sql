/*
  # Add 2FA support to users table

  1. Changes
    - Add two_factor_secret column for storing TOTP secrets
    - Add two_factor_enabled flag to track 2FA status
    
  2. Security
    - Maintain existing RLS policies
    - Ensure two_factor fields are protected
*/

ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS two_factor_secret text;
ALTER TABLE auth.users ADD COLUMN IF NOT EXISTS two_factor_enabled boolean DEFAULT false;

-- Update RLS policies to include new columns
CREATE POLICY "Users can read their own 2FA settings"
  ON auth.users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own 2FA settings"
  ON auth.users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);