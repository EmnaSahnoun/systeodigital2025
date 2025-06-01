export interface Client {
  id?: string; // Ou number, selon votre backend
  name: string;
  address?: string;
  email: string;
  phone?: string;
  createdAt?: number;
  idCompany: string;
  companyName: string; 
}