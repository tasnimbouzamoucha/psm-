export interface Role {
  id: number;
  libelle: string;   // 'ADMIN' | 'COLLABORATEUR'
}

export interface User {
  id: number;
  email: string;
  tel: string;
  nom: string;
  prenom: string;
  roles: Role[];
}
