import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from "rxjs";

import { environment } from '../../../environments/environment.prod';
import {LoginRequest, LoginResponse, User} from "../models/auth.model";
import { rolesPermissions } from '../utils/roles';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public baseUrl:string = environment.baseUrl;

  constructor(private http:HttpClient) {}

  public get  header() {
    return {
      headers: {
        'Authorization': `Bearer ${sessionStorage.getItem('accessToken')}`
      }
    }
  };

  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${this.baseUrl}/auth/login/`, credentials);
  }

  logout(): void {
    localStorage.clear();
    sessionStorage.clear();
  }

  saveUserData(resp: LoginResponse): void {
    sessionStorage.setItem('accessToken', resp.access);
    sessionStorage.setItem('refreshToken', resp.refresh);
    sessionStorage.setItem('userName', resp.user.first_name);
    sessionStorage.setItem('userGroup', JSON.stringify(resp.user.groups));
  }

  getUser(): User | null {
    const userName = sessionStorage.getItem('userName');
    return userName ? JSON.parse(userName) : null;
  }

  changePassword(data:{}){
    const url = `${this.baseUrl}/auth/password/change/`;
    return this.http.post(url, data, this.header)
  };

  resetPassword(data:{}){
    const url = `${this.baseUrl}/auth/password/reset/`;
    return this.http.post(url, data)
  };

  confirmResetPassword(data:{}){
    const url = `${this.baseUrl}/auth/password/reset/confirm/`;
    return this.http.post(url, data)
  };

  refreshToken(data:{}){
    const url = `${this.baseUrl}/auth/token/refresh/`;
    return this.http.post(url, data)
  };

  hasPermission(permission: string): boolean {
    const userRoles = JSON.parse(sessionStorage.getItem('userGroup') ||  '');
    return userRoles.some((role:any) => rolesPermissions[role].permissions.includes(permission));
  };

  validateWithOtp(phone_number: string) {
    const url = `${this.baseUrl}/auth/validate/?phone_number=${phone_number}`;
    return this.http.get(url, this.header)
  }

}
