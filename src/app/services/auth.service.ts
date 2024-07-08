import { HttpClient } from '@angular/common/http';
import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import { User } from '../models/user.model';

const USER_STORAGE_KEY = 'user';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  http = inject(HttpClient);
  router = inject(Router);

  #userSignal = signal<User | null>(null);

  user = this.#userSignal.asReadonly();

  isLoggedIn = computed(() => !!this.user());

  constructor() {
    this.loadUserFromStorage();
    effect(() => {
      const user = this.user();
      if (user) {
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      }
    });
  }

  async loadUserFromStorage() {
    const json = localStorage.getItem(USER_STORAGE_KEY);
    if (json) {
      const user = JSON.parse(json);
      this.#userSignal.set(user);
    }
  }

  async login(email: string, password: string): Promise<User> {
    const login$ = this.http.post<User>(`${environment.apiRoot}/login`, {
      email,
      password,
    });
    const user = await firstValueFrom(login$);
    this.#userSignal.set(user);
    return user;
  }

  async logout() {
    localStorage.removeItem(USER_STORAGE_KEY);
    this.#userSignal.set(null);
    await this.router.navigateByUrl('/login');
  }
}
