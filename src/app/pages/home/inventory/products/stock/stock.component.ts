import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { InventoryService } from '../../../../../core/services/inventory.service';
import {Product, Stock} from "../../../../../core/interfaces/product";

@Component({
  selector: 'app-stock',
  templateUrl: './stock.component.html',
  styleUrls: ['./stock.component.scss'],
})
export class StockComponent  implements OnInit {
  public productId: number = 0;
  public showDeleteAlert: boolean = false;
  public product!: Product;
  public stocks!: Stock[];

  constructor(private activatedRoute:ActivatedRoute, private inventorySvc:InventoryService) { }

  ngOnInit() {
    this.activatedRoute.params.subscribe((params: any) => {
      this.productId = +params['id'];
      this.getStocksDetail();
    });
  }

  getStocksDetail(): void {
    this.inventorySvc.getProductById(this.productId).subscribe({
      next: (resp: Product) => {
        this.product = resp;
      },
      error: (err: any) => {
        console.error('Error al obtener el producto:', err);
      }
    });
  }

  viewDetails(stockId: number): void {
    console.log(stockId);
  }

  delete(event:boolean){
    this.showDeleteAlert = !this.showDeleteAlert;
  }

}
