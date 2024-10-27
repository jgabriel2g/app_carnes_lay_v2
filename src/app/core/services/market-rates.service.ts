import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class MarketRatesService {

  constructor(private http:HttpClient, private authSvc:AuthService) { }

  getMarketRates(limit:number, offset:number){
    const url = `${this.authSvc.baseUrl}/sale/product-quotation/?limit=${limit}&offset=${offset}`;
    return this.http.get(url, this.authSvc.header);
  };

  newMarketRate(data:{}){
    const url = `${this.authSvc.baseUrl}/sale/product-quotation/`;
    return this.http.post(url, data, this.authSvc.header);
  };

  deleteMarketRate(id:string){
    const url = `${this.authSvc.baseUrl}/sale/product-quotation/${id}/`;
    return this.http.delete(url,  this.authSvc.header);
  };
}
