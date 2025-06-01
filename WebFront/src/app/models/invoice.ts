import { Agence } from "./agence.model";
import { InvoiceLine } from "./invoiceLine";

export interface Invoice {
  id: string;
  company: Agence;
  documentType: DocumentType; // "INVOICE"
  documentNumber: string;
  createdAt: number;
  status: InvoiceStatus; // e.g., "UNPAID", "PAID", "DRAFT"
  discount: number;
  subTotal: number;
  taxAmount: number;
  totalAmount: number;
  notes: string;
  lines: InvoiceLine[];
}
export enum InvoiceStatus {
  UNPAID = "UNPAID",
  PAID = "PAID"
}

export enum DocumentType {
  INVOICE = "INVOICE",
  QUOTATION = "QUOTATION", // Or "DEVIS" if that's what backend uses
  // Add other types as needed (e.g., CREDIT_NOTE)
}