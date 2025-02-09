import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { InventoryService } from '../../../../../core/services/inventory.service';
import {Product, Stock} from "../../../../../core/models/product";

@Component({
  selector: 'app-stock',
  templateUrl: './stock.component.html',
  styleUrls: ['./stock.component.scss'],
})
export class StockComponent  implements OnInit {
  public productId: string =  '';
  public productName: string =  '';
  public productPresentation: string =  '';
  public showDeleteAlert: boolean = false;
  public product!: Product;
  public stocks!: Stock[];
  public showStockDetailModal:boolean = false;
  constructor(private activatedRoute:ActivatedRoute, private inventorySvc:InventoryService) { }

  ngOnInit() {
    this.refreshStocks()
  }
  refreshStocks(): void {
    this.activatedRoute.params.subscribe((params: any) => {
      this.productId = params['id'];
      this.getStocksDetail();
    });
  }

  getStocksDetail(): void {
    /* TODO INTERFAZ STOCK */
    this.inventorySvc.getStockByProduct(this.productId).subscribe({
      next: (resp: any) => {
        this.stocks = resp.results;
         console.log(this.stocks)
      },
      error: (err: any) => {
        console.error('Error al obtener el producto:', err);
      }
    });
  }


  delete(event:boolean){
    this.showDeleteAlert = !this.showDeleteAlert;
  };

  showStockDetail(productId:string, productName:string, productPresentationUnit:string){
      this.productId = productId;
      this.productName = productName;
      this.productPresentation = productPresentationUnit;
      this.showStockDetailModal = true;
  };

  closeModal(event:boolean){
    this.showStockDetailModal = false;
    this.refreshStocks();
  };

}
