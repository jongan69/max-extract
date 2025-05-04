/*
  # Initial schema for Mass Extract app

  1. New Tables
    - `ruggers`
      - `id` (uuid, primary key)
      - `handle` (text, unique)
      - `wallet_address` (text, unique)
      - `description` (text)
      - `created_at` (timestamp)
      - `created_by` (uuid, references auth.users)
    
    - `votes`
      - `id` (uuid, primary key)
      - `rugger_id` (uuid, references ruggers)
      - `user_id` (uuid, references auth.users)
      - `vote_type` (text, either 'up' or 'down')
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users
*/

-- Create ruggers table
CREATE TABLE IF NOT EXISTS ruggers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  handle text NOT NULL,
  wallet_address text NOT NULL,
  description text,
  created_at timestamptz DEFAULT now(),
  created_by uuid REFERENCES auth.users NOT NULL,
  UNIQUE(handle),
  UNIQUE(wallet_address)
);

-- Create votes table
CREATE TABLE IF NOT EXISTS votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rugger_id uuid REFERENCES ruggers NOT NULL,
  user_id uuid REFERENCES auth.users NOT NULL,
  vote_type text NOT NULL CHECK (vote_type IN ('up', 'down')),
  created_at timestamptz DEFAULT now(),
  UNIQUE(rugger_id, user_id)
);

-- Enable RLS
ALTER TABLE ruggers ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Policies for ruggers table
CREATE POLICY "Anyone can view ruggers"
  ON ruggers
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can create ruggers"
  ON ruggers
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = created_by);

-- Policies for votes table
CREATE POLICY "Anyone can view votes"
  ON votes
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can vote"
  ON votes
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own votes"
  ON votes
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);