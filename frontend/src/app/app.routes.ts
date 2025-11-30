import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    title: '5alasly - Welcome',
    // 1. Add 'data' to fix the minification/active-tab issue
    data: { key: '' },
    loadComponent: () => import('./components/landing-page/landing-page.component')
      .then(m => m.LandingPageComponent)
  },
  {
    path: 'auth',
    title: 'Login | 5alasly',
    data: { key: 'auth' },
    loadComponent: () => import('./components/auth-screen/auth-screen.component')
      .then(m => m.AuthScreenComponent)
  },
  {
    path: 'home',
    title: 'Dashboard | 5alasly',
    data: { key: 'home' },
    loadComponent: () => import('./components/home-dashboard/home-dashboard') // Fixed path consistency
      .then(m => m.HomeDashboardComponent)
  },
  {
    path: 'create',
    title: 'New Request | 5alasly',
    data: { key: 'create' },
    loadComponent: () => import('./components/create-request/create-request') // Fixed path consistency
      .then(m => m.CreateRequestComponent)
  },
  {
    // 2. Best Practice: Route parameters usually go here (e.g., details/:id)
    path: 'details',
    title: 'Request Details | 5alasly',
    data: { key: 'details' },
    loadComponent: () => import('./components/request-details/request-details.component')
      .then(m => m.RequestDetailsComponent)
  },
  {
    path: 'profile',
    title: 'My Profile | 5alasly',
    data: { key: 'profile' },
    loadComponent: () => import('./components/user-profile/user-profile.component')
      .then(m => m.UserProfileComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
