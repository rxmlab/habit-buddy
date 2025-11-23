import { Injectable } from '@angular/core';
import { AuthUser } from '../interfaces/user.interface';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private _user: AuthUser | null = null;

  constructor() { }

  getUser(): AuthUser | null {
    return this._user;
  }

  setUser(user: AuthUser | null): void {
    this._user = user;
  }
}
