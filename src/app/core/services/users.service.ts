import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class UsersService {

  constructor(private http:HttpClient, private authSvc:AuthService) { }

  getUsers(filters:any){
   const url = `${this.authSvc.baseUrl}/users/?limit=${filters?.limit}&offset=${filters?.offset}&search=${filters?.search}`
    return this.http.get(url, this.authSvc.header)
  };


  createUsers(data:{}){
    const url = `${this.authSvc.baseUrl}/auth/register/`;
    return this.http.post(url, data, this.authSvc.header);
  };

  updateUsers(data:{}, id:any){
    const url = `${this.authSvc.baseUrl}/users/${id}/`;
    return this.http.put(url,data , this.authSvc.header);
  };

}
