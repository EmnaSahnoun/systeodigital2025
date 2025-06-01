export interface Notification {
  id: string; // Ou number, selon votre backend
  message: string;
  read: boolean;
  timestamp?: string; // Optionnel, si votre backend l'inclut
  // Ajoutez d'autres propriétés si nécessaire
}