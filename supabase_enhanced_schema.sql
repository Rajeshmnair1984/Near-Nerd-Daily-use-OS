-- Enhanced Supabase schema with auth, multi-tenant, and expanded fields
-- Run this after the base supabase_schema.sql

-- Create organizations table for multi-tenant support
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create user roles enum type
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('super_admin', 'admin', 'manager', 'staff', 'viewer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create user profiles with roles and organization
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE NOT NULL,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT,
    avatar_url TEXT,
    role user_role DEFAULT 'staff' NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add organization_id and vendor_id to locations
ALTER TABLE locations ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

-- Enhance bills table with new fields
ALTER TABLE bills ADD COLUMN IF NOT EXISTS vendor_id UUID REFERENCES vendors(id) ON DELETE SET NULL;
ALTER TABLE bills ADD COLUMN IF NOT EXISTS invoice_number TEXT;
ALTER TABLE bills ADD COLUMN IF NOT EXISTS payment_method TEXT;
ALTER TABLE bills ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE bills ADD COLUMN IF NOT EXISTS due_date DATE;
ALTER TABLE bills ADD COLUMN IF NOT EXISTS paid_date DATE;
ALTER TABLE bills ADD COLUMN IF NOT EXISTS gst_amount NUMERIC(10, 2);
ALTER TABLE bills ADD COLUMN IF NOT EXISTS pst_amount NUMERIC(10, 2);
ALTER TABLE bills ADD COLUMN IF NOT EXISTS subtotal NUMERIC(12, 2);
ALTER TABLE bills ADD COLUMN IF NOT EXISTS tax_total NUMERIC(10, 2);
ALTER TABLE bills ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;
ALTER TABLE bills ADD COLUMN IF NOT EXISTS recurring_frequency TEXT CHECK (recurring_frequency IN ('weekly', 'biweekly', 'monthly', 'quarterly', 'semiannual', 'annual', 'once'));
ALTER TABLE bills ADD COLUMN IF NOT EXISTS recurring_end_date DATE;

-- Link documents to bills
ALTER TABLE documents ADD COLUMN IF NOT EXISTS bill_id UUID REFERENCES bills(id) ON DELETE CASCADE;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

-- Add organization_id to vendors and documents
ALTER TABLE vendors ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE;

-- Create billing history table for audit trail
CREATE TABLE IF NOT EXISTS bill_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    bill_id UUID NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
    status_before TEXT,
    status_after TEXT,
    changed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own profile and profiles in their organization
CREATE POLICY "Users can see their own profile" ON user_profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Org admins can see all profiles in their org" ON user_profiles
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
        AND (
            SELECT role FROM user_profiles WHERE id = auth.uid()
        ) IN ('super_admin', 'admin')
    );

-- Enable RLS on organizations
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see their own organization
CREATE POLICY "Users can see their organization" ON organizations
    FOR SELECT USING (
        id IN (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

-- Enable RLS on bills
ALTER TABLE bills ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only see bills from their organization
CREATE POLICY "Users can see bills in their org" ON bills
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

CREATE POLICY "Staff and above can insert bills" ON bills
    FOR INSERT WITH CHECK (
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
        AND (
            SELECT role FROM user_profiles WHERE id = auth.uid()
        ) IN ('super_admin', 'admin', 'manager', 'staff')
    );

-- Enable RLS on locations, vendors, documents
ALTER TABLE locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;

-- Similar RLS for locations
CREATE POLICY "Users can see locations in their org" ON locations
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

-- Similar RLS for vendors
CREATE POLICY "Users can see vendors in their org" ON vendors
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

-- Similar RLS for documents
CREATE POLICY "Users can see documents in their org" ON documents
    FOR SELECT USING (
        organization_id IN (
            SELECT organization_id FROM user_profiles WHERE id = auth.uid()
        )
    );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_profiles_org ON user_profiles(organization_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_bills_org ON bills(organization_id);
CREATE INDEX IF NOT EXISTS idx_bills_status ON bills(status);
CREATE INDEX IF NOT EXISTS idx_bills_due_date ON bills(due_date);
CREATE INDEX IF NOT EXISTS idx_bills_vendor ON bills(vendor_id);
CREATE INDEX IF NOT EXISTS idx_locations_org ON locations(organization_id);
CREATE INDEX IF NOT EXISTS idx_vendors_org ON vendors(organization_id);
CREATE INDEX IF NOT EXISTS idx_documents_org ON documents(organization_id);
CREATE INDEX IF NOT EXISTS idx_documents_bill ON documents(bill_id);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.organizations TO authenticated;
GRANT ALL ON public.user_profiles TO authenticated;
GRANT ALL ON public.bills TO authenticated;
GRANT ALL ON public.locations TO authenticated;
GRANT ALL ON public.vendors TO authenticated;
GRANT ALL ON public.documents TO authenticated;
GRANT ALL ON public.bill_history TO authenticated;
