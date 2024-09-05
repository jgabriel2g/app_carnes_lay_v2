import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public baseUrl:string = environment.baseUrl;
  public get  header() {
    return {
      headers: {
        'Authorization': `Bearer ${sessionStorage.getItem('accessToken')}`
      }
    }
  };
  constructor(private http:HttpClient) { }

  login(data:{}){
    const url = `${this.baseUrl}/auth/login/`;
    return this.http.post(url, data);
  };

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

}
