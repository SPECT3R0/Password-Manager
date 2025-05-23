/*
  # Create passwords table and security policies

  1. New Tables
    - `passwords`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `website` (text)
      - `username` (text)
      - `encrypted_password` (text)
      - `website_icon` (text, nullable)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `passwords` table
    - Add policies for CRUD operations
    - Only allow users to access their own passwords
*/

CREATE TABLE IF NOT EXISTS passwords (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  website text NOT NULL,
  username text NOT NULL,
  encrypted_password text NOT NULL,
  website_icon text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE passwords ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can create their own passwords"
  ON passwords
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own passwords"
  ON passwords
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own passwords"
  ON passwords
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own passwords"
  ON passwords
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER passwords_updated_at
  BEFORE UPDATE ON passwords
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();