import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { Client } from '../models/client.model';
import {PaginatedResponse} from "../models/global.model";
import {Observable} from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ThirdPartyService {

  constructor(private http:HttpClient, private authSvc:AuthService) { }


  getClients(
    limit:number,
    offset:number
  ): Observable<PaginatedResponse<Client>> {
    const url = `${this.authSvc.baseUrl}/third-party/client/?limit=${limit}&offset=${offset}`;
    return this.http.get<PaginatedResponse<Client>>(url, this.authSvc.header);
  };

  newClient(data:{}){
    const url = `${this.authSvc.baseUrl}/third-party/client/`;
    return this.http.post(url, data ,this.authSvc.header);
  };

  updateClient(data:{}, id:any){
    const url = `${this.authSvc.baseUrl}/third-party/client/${id}/`;
    return this.http.patch(url, data ,this.authSvc.header);
  };

  deleteClient(id:any){
    const url = `${this.authSvc.baseUrl}/third-party/client/${id}/`;
    return this.http.delete(url,this.authSvc.header);
  };


  getProviders(limit:number, offset:number){
    const url = `${this.authSvc.baseUrl}/third-party/provider/?limit=${limit}&offset=${offset}`;
    return this.http.get(url, this.authSvc.header);
  };

  newProvider(data:{}){
    const url = `${this.authSvc.baseUrl}/third-party/provider/`;
    return this.http.post(url, data ,this.authSvc.header);
  };

  updateProvider(data:{}, id:any){
    const url = `${this.authSvc.baseUrl}/third-party/provider/${id}/`;
    return this.http.patch(url, data ,this.authSvc.header);
  };

  deleteProvider(id:any){
    const url = `${this.authSvc.baseUrl}/third-party/provider/${id}/`;
    return this.http.delete(url,this.authSvc.header);
  };

}
