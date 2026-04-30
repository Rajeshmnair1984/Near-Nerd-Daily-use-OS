export interface Location {
  id: string;
  name: string; // LOCATION NAME
  address?: string;
  contact?: string;
  created_at?: string;

  // Infrastructure Matrix Fields
  store_code?: string;
  brand_name?: string;
  opening_date?: string;
  street_address?: string;
  city?: string;
  province?: string;
  postal_code?: string;
  operational_status?: "Active" | "Under Construction" | "Closed" | "Planned";
  is_store_master?: boolean;
  notes?: string;

  // LANDLORD INFORMATION
  landlord_company?: string;
  landlord_name?: string;
  landlord_email?: string;
  landlord_phone?: string;
  primary_contact_person?: string;
  contact_person_name?: string;
  contact_email?: string;
  contact_phone?: string;
  property_mgmt_involved?: boolean;
  emergency_contact_name?: string;
  emergency_phone?: string;
  landlord_intel_sync?: boolean;

  // LEASE & LEGAL
  lease_start?: string;
  lease_expiry?: string;
  lease_term_years?: number;
  lease_notice_months?: number;
  renewal_option?: boolean;
  renewal_terms?: string;
  base_rent?: number;
  additional_rent_cam?: number;
  deposit_amount?: number;
  lease_doc_url?: string;
  lease_intel_sync?: boolean;

  // INSURANCE
  insurance_company?: string;
  insurance_broker_name?: string;
  policy_number?: string;
  coverage_type?: string;
  premium_amount?: number;
  premium_frequency?: "Monthly" | "Quarterly" | "Annual";
  monthly_equivalent?: number;
  insurance_start_date?: string;
  insurance_expiry_date?: string;
  broker_contact_name?: string;
  broker_phone?: string;
  broker_email?: string;
  insurance_intel_sync?: boolean;

  // COMPLIANCE (Critical Dates)
  biz_license_expiry?: string;
  fire_inspection_due?: string;
  fire_extinguisher_expiry?: string;
  compliance_intel_sync?: boolean;

  // INTERNAL OPS (Store Operations)
  store_manager_name?: string;
  staff_count?: number;
  manager_phone?: string;
  manager_email?: string;
  ops_intel_sync?: boolean;
}

export interface CreateLocationInput extends Partial<
  Omit<Location, "id" | "created_at">
> {
  name: string;
}
