import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { InventoryService } from '../../../../../core/services/inventory.service';

@Component({
  selector: 'app-stock',
  templateUrl: './stock.component.html',
  styleUrls: ['./stock.component.scss'],
})
export class StockComponent  implements OnInit {
  public productId:any;
  public showDeleteAlert:boolean = false;
  public productInfo:any;
  constructor(private activatedRoute:ActivatedRoute, private inventorySvc:InventoryService) { }

  ngOnInit() {
    this.activatedRoute.params.subscribe((params:any) => {
      console.log(params);
      this.productId = params.id;
      this.getStocksDetail();
    })
  }


  getStocksDetail(){
    this.inventorySvc.getProductById(this.productId)
    .subscribe({
      error:(err:any) => {
        console.log(err);
      },
      next:(resp:any) => {
        console.log(resp);
        this.productInfo = resp;
      }
    })
  }

  onDelete(){
    this.showDeleteAlert = !this.showDeleteAlert;
  }

  delete(event:boolean){
    this.showDeleteAlert = !this.showDeleteAlert;

  }

}
