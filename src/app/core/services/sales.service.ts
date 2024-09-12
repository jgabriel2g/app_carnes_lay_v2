import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class SalesService {

  constructor(private authSvc:AuthService, private http:HttpClient) { }


  getPaymentMethods(){
    const url = `${this.authSvc.baseUrl}/configuration/payment-method/`;
    return this.http.get(url, this.authSvc.header);
  };

  // SALES BOX MANAGE ENDPOINTS

  getBoxSales(){
    const url = `${this.authSvc.baseUrl}/sale/`;
    return this.http.get(url, this.authSvc.header);
  };

  getBoxSaleById(id:any){
    const url = `${this.authSvc.baseUrl}/sale/${id}/`;
    return this.http.get(url, this.authSvc.header);
  };

  createNewBoxSale(data:{}){
    const url = `${this.authSvc.baseUrl}/sale/`;
    return this.http.post(url, data,  this.authSvc.header);
  };

  closeBoxSale(id:any){
    const url = `${this.authSvc.baseUrl}/sale/${id}/close/`;
    return this.http.post(url, {},  this.authSvc.header);
  };




  // DISPLAY STOCK MANAGE

  getDisplayStock(limit:number, offset:number){
    const url =  `${this.authSvc.baseUrl}/sale/display-stock/?limit=${limit}&offset=${offset}`;
    return this.http.get(url, this.authSvc.header);
  };

  createDisplayStock(data:{}){
    const url =  `${this.authSvc.baseUrl}/sale/display-stock/`;
    return this.http.post(url, data, this.authSvc.header);
  };

  getDisplayStockById(id:any){
    const url =  `${this.authSvc.baseUrl}/sale/display-stock/${id}/`;
    return this.http.get(url, this.authSvc.header);
  }

  updateDisplayStock(data:{}, id:any){
    const url =  `${this.authSvc.baseUrl}/sale/display-stock/${id}/`;
    return this.http.patch(url,data,  this.authSvc.header);
  }

  // BILLS MANAGE

  getBills(limit:number, offset:number){
    const url =  `${this.authSvc.baseUrl}/sale/bill/?limit=${limit}&offset=${offset}`;
    return this.http.get(url, this.authSvc.header);
  }

  createBill(data:{}){
    const url =  `${this.authSvc.baseUrl}/sale/bill/`;
    return this.http.post(url, data, this.authSvc.header);
  };

  getSaleById(id:any){
    const url =  `${this.authSvc.baseUrl}/sale/bill/${id}/`;
    return this.http.get(url, this.authSvc.header);
  }

  deleteBillSale(id:any){
    const url =  `${this.authSvc.baseUrl}/sale/bill/${id}/`;
    return this.http.delete(url, this.authSvc.header);
  }

}
