import { Routes } from '@angular/router';

import { Login } from './pages/login/login';
import { Pacientes } from './pages/pacientes/pacientes';
import { Admin } from './pages/admin/admin';

import { authGuard, adminGuard } from './core/guards/auth.guard';

export const routes: Routes = [

  {
    path: '',
    component: Login
  },

  {
    path: 'pacientes',
    component: Pacientes,
    canActivate: [authGuard]
  },

  {
    path: 'admin',
    component: Admin,
    canActivate: [authGuard, adminGuard]
  },

  {
    path: '**',
    redirectTo: ''
  }

];