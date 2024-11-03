import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import {Observable} from "rxjs";
import {Product} from "../interfaces/product";

@Injectable({
  providedIn: 'root'
})
export class InventoryService {

  constructor(private http:HttpClient, private authSvc:AuthService) { }

  /* PRODUCTS ENDPOINTS */
  getProducts(
    limit:number,
    offset:number,
    isActive:boolean
  ) {
    const url = `${this.authSvc.baseUrl}/inventory/product/?limit=${limit}&offset=${offset}&is_active=${isActive}`;
    return this.http.get(url, this.authSvc.header);
  };

  getProductById(id: string): Observable<Product> {
    const url = `${this.authSvc.baseUrl}/inventory/product/${id}/`;
    return this.http.get<Product>(url, this.authSvc.header);
  }
  newProduct(data:{}){
    const url = `${this.authSvc.baseUrl}/inventory/product/`;
    return this.http.post(url, data, this.authSvc.header);
  };

  updateProduct(data:{}, id:any){
    const url = `${this.authSvc.baseUrl}/inventory/product/${id}/`;
    return this.http.patch(url, data, this.authSvc.header);
  };

  disableProduct( id:any, data:{}){
    const url = `${this.authSvc.baseUrl}/inventory/product/${id}/`;
    return this.http.patch(url, data,  this.authSvc.header);
  };

  getUnitTypes(){
    const url = `${this.authSvc.baseUrl}/inventory/unit/`;
    return this.http.get(url, this.authSvc.header)
  };

  getWeightTypes(){
    const url = `${this.authSvc.baseUrl}/inventory/weight/`;
    return this.http.get(url, this.authSvc.header)
  };

  getProductCategories(){
    const url = `${this.authSvc.baseUrl}/inventory/category/`;
    return this.http.get(url, this.authSvc.header)
  }

  /* LOAD STOCK ENDPOINTS */

  getStocks(limit:number, offset:number){
    const url = `${this.authSvc.baseUrl}/inventory/stock/?limit=${limit}&offset=${offset}`;
    return this.http.get(url, this.authSvc.header);
  };

  createStock(data:{}){
    const url = `${this.authSvc.baseUrl}/inventory/stock/`;
    return this.http.post(url, data, this.authSvc.header);
  };

  deleteStockById(id:string){
    const url = `${this.authSvc.baseUrl}/inventory/stock/${id}/`;
    return this.http.delete(url, this.authSvc.header);
  }

  getStockDetail( stockId:any){
    const url = `${this.authSvc.baseUrl}/inventory/stock-detail/?stock_id=${stockId}`;
    return this.http.get(url, this.authSvc.header);
  };

  addStockDetail(data:{}){
    const url = `${this.authSvc.baseUrl}/inventory/stock-detail/`;
    return this.http.post(url, data, this.authSvc.header);
  };

  deleteStockDetail(id:any){
    const url = `${this.authSvc.baseUrl}/inventory/stock-detail/${id}/`;
    return this.http.delete(url, this.authSvc.header);
  }

  purchaseStockDetail(data:{}){
    const url = `${this.authSvc.baseUrl}/inventory/purchase/`;
    return this.http.post(url, data, this.authSvc.header);
  };

  updatePurchase(data:{}, id:any){
    const url = `${this.authSvc.baseUrl}/inventory/purchase/${id}/`;
    return this.http.patch(url, data, this.authSvc.header);
  }

  getPurchases(limit:number, offset:number){
    const url = `${this.authSvc.baseUrl}/inventory/purchase/?limit=${limit}&offset=${offset}`;
    return this.http.get(url,  this.authSvc.header);
  };


  getPurchaseById(id:any){
    const url = `${this.authSvc.baseUrl}/inventory/purchase/${id}/`;
    return this.http.get(url,  this.authSvc.header);
  };

  getStockDetailsByStock(stockId:string){
    const url = `${this.authSvc.baseUrl}/inventory/stock-detail/?stock_id=${stockId}`;
    return this.http.get(url, this.authSvc.header);
  };

  getStockByProduct(productId:string){
    const url = `${this.authSvc.baseUrl}/inventory/stock/?product_id=${productId}`;
    return this.http.get(url, this.authSvc.header);
  };

  updateStockDetail(stockDetailId:string, data:{}){
    const url = `${this.authSvc.baseUrl}/inventory/stock-detail/${stockDetailId}/`;
    return this.http.patch(url, data ,this.authSvc.header);
  };




}
