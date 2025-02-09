import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import {Observable} from "rxjs";
import {DocTypeListResponse} from "../models/docType.model";

@Injectable({
  providedIn: 'root'
})
export class GlobalService {

  constructor(private http:HttpClient, private authSvc:AuthService) { }


  getDocTypes(): Observable<DocTypeListResponse> {
    const url = `${this.authSvc.baseUrl}/configuration/identification-type/`;
    return this.http.get<DocTypeListResponse>(url, this.authSvc.header);
  }

  getPaymentMethods(){
    const url = `${this.authSvc.baseUrl}/configuration/payment-method/`;
    return this.http.get(url, this.authSvc.header);
  };

  getPeriodType(){
    const url = `${this.authSvc.baseUrl}/configuration/period-type/`;
    return this.http.get(url, this.authSvc.header);
  };

  getPersonType(){
    const url = `${this.authSvc.baseUrl}/configuration/person-type/`;
    return this.http.get(url, this.authSvc.header);
  };

  getRegimeType(){
    const url = `${this.authSvc.baseUrl}/configuration/regime-type/`;
    return this.http.get(url, this.authSvc.header);
  };

  getResponsibilities(){
    const url = `${this.authSvc.baseUrl}/configuration/responsibilities/`;
    return this.http.get(url, this.authSvc.header);
  };

  getDepartments(){
    const url = `${this.authSvc.baseUrl}/department/?limit=33&offset=0`;
    return this.http.get(url, this.authSvc.header);
  };
}
