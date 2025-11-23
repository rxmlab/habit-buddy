import { Injectable, signal, Signal } from '@angular/core';
import { AuthUser } from '../interfaces/user.interface';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private _user = signal<AuthUser | null>(null);

  constructor() { }

  getUser(): Signal<AuthUser | null> {
    return this._user.asReadonly();
  }

  setUser(user: AuthUser | null): void {
    this._user.set(user);
  }
}
