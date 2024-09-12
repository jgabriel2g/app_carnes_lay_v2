import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  constructor(private http:HttpClient, private authSvc:AuthService) { }

  getProfileInfo(){
      const url = `${this.authSvc.baseUrl}/auth/user/`;
      return this.http.get(url, this.authSvc.header)
  };

  updateUserInfo(data:{}){
    const url = `${this.authSvc.baseUrl}/auth/user/`;
    return this.http.patch(url, data, this.authSvc.header);
  };
}
