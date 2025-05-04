/*
  # Update ruggers table RLS policies

  1. Changes
    - Drop existing insert policy
    - Create new insert policy that properly handles created_by field
    
  2. Security
    - Maintains existing select policy for public access
    - Updates insert policy to ensure created_by is set to authenticated user's ID
*/

-- Drop the existing insert policy
DROP POLICY IF EXISTS "Authenticated users can create ruggers" ON ruggers;

-- Create new insert policy that properly handles created_by
CREATE POLICY "Authenticated users can create ruggers"
ON ruggers
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = created_by
);