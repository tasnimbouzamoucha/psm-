import { Client } from './client.model';

export interface Projet {
  id?: number;
  libelle: string;
  budget: number;
  duree: number;        // en mois
  description: string;
  client?: Client;
  hasCahierCharges?: boolean;     // un PDF est-il attaché ?
  cahierChargesNom?: string | null; // nom du PDF
}

// Corps envoyé à l'API pour créer / modifier un projet
export interface ProjetRequest {
  libelle: string;
  budget: number;
  duree: number;
  description: string;
  idClient: number;
}
