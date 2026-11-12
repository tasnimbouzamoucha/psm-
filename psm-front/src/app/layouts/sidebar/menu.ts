// Menu latéral. "roles" vide = visible par tout utilisateur connecté.
export interface MenuItem {
  label: string;
  icon?: string;
  link?: string;
  isTitle?: boolean;
  roles?: string[];
}

export const MENU: MenuItem[] = [
  { label: 'Menu', isTitle: true },
  { label: 'Tableau de bord', icon: 'ri-dashboard-2-line', link: '/dashboard' },

  { label: 'Gestion', isTitle: true },
  { label: 'Clients', icon: 'ri-building-line', link: '/clients' },
  { label: 'Projets', icon: 'ri-folder-chart-line', link: '/projets' },

  { label: 'Administration', isTitle: true, roles: ['ADMIN'] },
  { label: 'Utilisateurs', icon: 'ri-team-line', link: '/users', roles: ['ADMIN'] }
];
