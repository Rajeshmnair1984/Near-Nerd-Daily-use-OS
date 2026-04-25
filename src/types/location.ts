export interface Location {
  id: string;
  name: string;
  address?: string;
  contact?: string;
  created_at?: string;
}

export interface CreateLocationInput {
  name: string;
  address?: string;
  contact?: string;
}
