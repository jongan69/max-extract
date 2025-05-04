/*
  # Allow anonymous submissions
  
  1. Changes
    - Make created_by column nullable in ruggers table
    - Update RLS policies to allow public inserts
    - Keep vote tracking for authenticated users only
*/

-- Make created_by nullable
ALTER TABLE ruggers ALTER COLUMN created_by DROP NOT NULL;

-- Drop the existing INSERT policy
DROP POLICY IF EXISTS "Authenticated users can create ruggers" ON ruggers;

-- Create new INSERT policy allowing public submissions
CREATE POLICY "Anyone can create ruggers"
ON ruggers
FOR INSERT
TO public
WITH CHECK (true);