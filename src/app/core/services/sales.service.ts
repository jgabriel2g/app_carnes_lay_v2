import { Injectable } from '@angular/core';
import { AuthService } from './auth.service';
import { HttpClient, HttpParams } from '@angular/common/http';
import {mapToCamelCase} from "../utils/mapper";
import {getDisplayStockResponse} from "../models/displayStock";
import {map, Observable} from "rxjs";
import {PaymentMethod} from "../models/global.model";
import {Bill, BillSummary, Sale} from "../models/sale.model";
import {PaginatedResponse} from "../models/global.model";

@Injectable({
  providedIn: 'root'
})
export class SalesService {

  constructor(
    private authSvc:AuthService,
    private http:HttpClient
  ) { }

  // PAYMENT METHODS
  getPaymentMethods(): Observable<PaginatedResponse<PaymentMethod>> {
    const url = `${this.authSvc.baseUrl}/configuration/payment-method/`;
    return this.http.get<PaginatedResponse<PaymentMethod>>(url, this.authSvc.header);
  };

  // SALES MANAGE ENDPOINTS
  getSales(limit:number, offset:number): Observable<PaginatedResponse<Sale>> {
    const url = `${this.authSvc.baseUrl}/sale/?limit=${limit}&offset=${offset}`;
    return this.http.get<PaginatedResponse<Sale>>(url, this.authSvc.header);
  };

  getMyOpenSale(){
    const url = `${this.authSvc.baseUrl}/sale/get_my_open_sale/`;
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

  getDisplayStock(limit: number, offset: number, search: string = '') {
    let params = new HttpParams();
    if (search) {
      params = params.set('search', search);
    }
    const url = `${this.authSvc.baseUrl}/sale/display-stock/?limit=${limit}&offset=${offset}`;

    return this.http.get<getDisplayStockResponse>(url, { headers: this.authSvc.header.headers, params })
      .pipe(
        map(response => {
          const camelCasedResponse = mapToCamelCase(response);
          camelCasedResponse.results = camelCasedResponse.results.map((result: any) => mapToCamelCase(result));
          return camelCasedResponse;
        })
      );
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

  getReportDisplayStock() {
    const url = `${this.authSvc.baseUrl}/sale/display-stock/get_total_inventory/`;
    return this.http.get<Blob>(url, {
      ...this.authSvc.header,
      responseType: 'blob' as 'json',
    });
  }

  // BILLS MANAGE
  getBillsBySale(
    limit: number,
    offset: number,
    saleId: string,
    clientName?: string
  ): Observable<PaginatedResponse<BillSummary>> {
    let params = new HttpParams()
      .set('limit', limit)
      .set('offset', offset)

    if (saleId) {
      params = params.set('sale_id', saleId);
    }

    if (clientName) {
      params = params.set('client_name', clientName);
    }

    return this.http.get<PaginatedResponse<BillSummary>>(
      `${this.authSvc.baseUrl}/sale/bill/`,
      { headers: this.authSvc.header.headers, params }
    );
  }

  createBill(data:{}){
    const url =  `${this.authSvc.baseUrl}/sale/bill/`;
    return this.http.post(url, data, this.authSvc.header);
  };

  deleteBillSale(id:any){
    const url =  `${this.authSvc.baseUrl}/sale/bill/${id}/`;
    return this.http.delete(url, this.authSvc.header);
  };

  deleteSale(id:string) {
    const url =  `${this.authSvc.baseUrl}/sale/${id}/`;
    return this.http.delete(url, this.authSvc.header);
  };

  sendToDian(id:string){
    const url = `${this.authSvc.baseUrl}/sale/bill/${id}/send_fe_to_dian/`;
    return this.http.post(url, {}, this.authSvc.header);
  }

  getBillById(id:string): Observable<Bill>{
    const url = `${this.authSvc.baseUrl}/sale/bill/${id}/`;
    return this.http.get<Bill>(url, this.authSvc.header);
  }

}
