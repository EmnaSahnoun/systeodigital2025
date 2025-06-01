export interface Agence {
    _id: string; // Utiliser _id si c'est ce que le backend renvoie
    name: string;
    address: string;
    email: string;
    phone: string;
    createdAt: string | Date; // Peut être string ou Date
    // Ajouter d'autres champs si nécessaire
  }