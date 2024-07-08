import { Routes } from '@angular/router';
import { isUserAuthenticated } from './guards/auth.guard';
import { HomeComponent } from './home/home.component';
import { LessonsComponent } from './lessons/lessons.component';
import { LoginComponent } from './login/login.component';

export const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    canActivate: [isUserAuthenticated],
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'lessons',
    component: LessonsComponent,
    canActivate: [isUserAuthenticated],
  },
  {
    path: '**',
    redirectTo: '/',
  },
];
