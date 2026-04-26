-- Add domain column to organizations table
ALTER TABLE organizations ADD COLUMN IF NOT EXISTS domain TEXT UNIQUE;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_organizations_domain ON organizations(domain);
