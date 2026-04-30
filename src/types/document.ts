export interface DocumentRecord {
  id: string;
  title: string;
  category: string;
  owner?: string;
  file_url?: string;
  renewal_date?: string;
  status: "Active" | "Needs Review" | "Archived";
  notes?: string;
  created_at?: string;
}

export interface CreateDocumentInput {
  title: string;
  category: string;
  owner?: string;
  file_url?: string;
  renewal_date?: string;
  status?: "Active" | "Needs Review" | "Archived";
  notes?: string;
}
