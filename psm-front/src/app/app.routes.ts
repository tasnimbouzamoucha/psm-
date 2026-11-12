import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { LayoutComponent } from './layouts/layout.component';

export const routes: Routes = [
  // Pages publiques
  { path: 'login', canActivate: [guestGuard],
    loadComponent: () => import('./account/login/login.component').then(m => m.LoginComponent) },
  { path: 'register', canActivate: [guestGuard],
    loadComponent: () => import('./account/register/register.component').then(m => m.RegisterComponent) },

  // Pages protégées (dans le layout Velzon : menu + navbar)
  {
    path: '',
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.DashboardComponent) },

      // Clients : ADMIN + COLLABORATEUR consultent et ajoutent, seul ADMIN modifie
      { path: 'clients',
        loadComponent: () => import('./pages/clients/client-list/client-list.component').then(m => m.ClientListComponent) },
      { path: 'clients/new',
        loadComponent: () => import('./pages/clients/client-form/client-form.component').then(m => m.ClientFormComponent) },
      { path: 'clients/edit/:id', canActivate: [roleGuard], data: { roles: ['ADMIN'] },
        loadComponent: () => import('./pages/clients/client-form/client-form.component').then(m => m.ClientFormComponent) },
      { path: 'clients/:id',
        loadComponent: () => import('./pages/clients/client-detail/client-detail.component').then(m => m.ClientDetailComponent) },

      // Projets
      { path: 'projets',
        loadComponent: () => import('./pages/projets/projet-list/projet-list.component').then(m => m.ProjetListComponent) },
      { path: 'projets/new',
        loadComponent: () => import('./pages/projets/projet-form/projet-form.component').then(m => m.ProjetFormComponent) },
      { path: 'projets/edit/:id', canActivate: [roleGuard], data: { roles: ['ADMIN'] },
        loadComponent: () => import('./pages/projets/projet-form/projet-form.component').then(m => m.ProjetFormComponent) },

      // Utilisateurs : ADMIN uniquement
      { path: 'users', canActivate: [roleGuard], data: { roles: ['ADMIN'] },
        loadComponent: () => import('./pages/users/user-list/user-list.component').then(m => m.UserListComponent) },

      { path: 'acces-refuse',
        loadComponent: () => import('./pages/acces-refuse/acces-refuse.component').then(m => m.AccesRefuseComponent) }
    ]
  },
  { path: '**', redirectTo: '' }
];
