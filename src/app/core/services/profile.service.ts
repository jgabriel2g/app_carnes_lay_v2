import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import {User} from "../models/auth.model";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ProfileService {

  constructor(private http:HttpClient, private authSvc:AuthService) { }

  getProfileInfo(): Observable<User> {
      const url = `${this.authSvc.baseUrl}/auth/user/`;
      return this.http.get<User>(url, this.authSvc.header)
  };

  updateUserInfo(data:{}){
    const url = `${this.authSvc.baseUrl}/auth/user/`;
    return this.http.patch(url, data, this.authSvc.header);
  };

}
