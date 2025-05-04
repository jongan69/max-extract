/*
  # Fix RLS policy for ruggers table

  1. Changes
    - Drop existing INSERT policy
    - Create new INSERT policy that properly handles created_by field
  
  2. Security
    - Ensures authenticated users can only create ruggers with their own user ID
    - Maintains existing SELECT policy for public access
*/

-- Drop the existing INSERT policy
DROP POLICY IF EXISTS "Authenticated users can create ruggers" ON ruggers;

-- Create new INSERT policy with proper user ID check
CREATE POLICY "Authenticated users can create ruggers"
ON ruggers
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = created_by
);