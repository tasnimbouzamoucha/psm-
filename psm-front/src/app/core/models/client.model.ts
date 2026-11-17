export interface Client {
  id?: number;
  nom: string;
  tel: string;
  email: string;
  adresse: string;
  hasLogo?: boolean;   // renvoyé par l'API : le client a-t-il un logo ?
}
