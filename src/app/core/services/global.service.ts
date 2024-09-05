import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class GlobalService {

  constructor(private http:HttpClient, private authSvc:AuthService) { }


  getDocTypes(){
    const url = `${this.authSvc.baseUrl}/configuration/identification-type/`;
    return this.http.get(url, this.authSvc.header);
  };

  getPaymentMethods(){
    const url = `${this.authSvc.baseUrl}/configuration/payment-method/`;
    return this.http.get(url, this.authSvc.header);
  };

  getPeriodType(){
    const url = `${this.authSvc.baseUrl}/configuration/period-type/`;
    return this.http.get(url, this.authSvc.header);
  };

  getDepartments(){
    const url = `${this.authSvc.baseUrl}/department/`;
    return this.http.get(url, this.authSvc.header);
  };
}
