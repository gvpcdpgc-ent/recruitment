-- Fix: Add unique constraint to position_id in position_forms
-- This is required for the 'upsert' operation to work correctly when updating forms.

-- 1. Remove any duplicate entries if they exist (keep the newest one)
DELETE FROM position_forms a
USING position_forms b
WHERE a.id < b.id 
AND a.position_id = b.position_id;

-- 2. Add the unique constraint
ALTER TABLE position_forms 
ADD CONSTRAINT position_forms_position_id_key UNIQUE (position_id);
