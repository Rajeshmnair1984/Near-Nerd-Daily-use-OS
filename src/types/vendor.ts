export interface Vendor {
  id: string;
  name: string;
  category: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  website?: string;
  notes?: string;
  status: 'Active' | 'Paused';
  created_at?: string;
}

export interface CreateVendorInput {
  name: string;
  category: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  website?: string;
  notes?: string;
  status?: 'Active' | 'Paused';
}

export interface UpdateVendorInput {
  name?: string;
  category?: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  website?: string;
  notes?: string;
  status?: 'Active' | 'Paused';
}
