import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class PayRollService {

  constructor(private authSvc:AuthService, private http:HttpClient) { }

  createPayroll(data:{}){
    const url = `${this.authSvc.baseUrl}/payroll/employee/`;
    return this.http.post(url, data, this.authSvc.header);
  };

  updatePayroll(id:string, data:{}){
    const url = `${this.authSvc.baseUrl}/payroll/employee/${id}/`;
    return this.http.patch(url, data, this.authSvc.header);
  };

  deletePayroll(id:string){
    const url = `${this.authSvc.baseUrl}/payroll/employee/${id}/`;
    return this.http.delete(url,  this.authSvc.header);
  };

  getPayroll(limit:number, offset:number){
    const url = `${this.authSvc.baseUrl}/payroll/employee/?limit=${limit}&offset=${offset}`;
    return this.http.get(url, this.authSvc.header);
  };

  getContractTypes(){
    const url = `${this.authSvc.baseUrl}/payroll/contract-type/`;
    return this.http.get(url, this.authSvc.header);
  };

  getAccountTypes(){
    const url = `${this.authSvc.baseUrl}/payroll/account-type/`;
    return this.http.get(url, this.authSvc.header);
  };

  getBankInformation(){
    const url = `${this.authSvc.baseUrl}/payroll/banking-information/`;
    return this.http.get(url, this.authSvc.header);
  };


  getPeriods(){
    const url = `${this.authSvc.baseUrl}/configuration/period-type/`;
    return this.http.get(url, this.authSvc.header);
  };




}
