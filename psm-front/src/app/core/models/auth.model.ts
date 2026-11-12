export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  nom: string;
  prenom: string;
  email: string;
  tel: string;
  password: string;
}

// Réponse de POST /api/auth/login
export interface AuthResponse {
  token: string;
  type: string;
  id: number;
  email: string;
  nom: string;
  prenom: string;
  roles: string[];
}

export type ConnectedUser = Omit<AuthResponse, 'token' | 'type'>;
