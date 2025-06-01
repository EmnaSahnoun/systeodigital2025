export interface MediaFileResponse {
  id: string;
  filename: string;
  description?: string;
  mediaType: string;
  contentType: string;
  size: number;
  uploadedBy: string;
  uploadDate: Date | string; // API might return string
  uploaderUsername?: string; // For frontend display
}