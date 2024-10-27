import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { AlertsService } from 'src/app/core/services/alerts.service';
import { InventoryService } from '../../../../../core/services/inventory.service';

@Component({
  selector: 'app-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
})
export class DetailsComponent  implements OnInit {

  @Input() productId:string = '';
  @Input() productName:string = '';
  @Input() productPresentationUnit:string = '';
  @Output() close = new EventEmitter<boolean>();
  public stockDetails:any[] = [];
  constructor(private inventorySvc:InventoryService, private alertSvc:AlertsService,) { }

  ngOnInit() {
    this.getStockDetails();
  }

  getStockDetails(){
    this.inventorySvc.getStockDetailsByStock(this.productId)
      .subscribe({
        error:(err:any) => {
          console.log(err);
        },
        next:(resp:any) => {
          console.log(resp);
          this.stockDetails = resp.results
        }
      });
  };

  updateStatusStockDetail(id:string, is_active:boolean){
    const data  = {
      is_active: !is_active
    }
    this.inventorySvc.updateStockDetail(id, data)
        .subscribe({
          error:(err:any) => {
            console.log(err);
            this.handleError(err);
          },
          next:(resp:any) => {
            console.log(resp);
            this.getStockDetails();
          }
        });
  };

  handleError(err: any) {
    if (err.error) {
      const errorKeys = Object.keys(err.error);

      let errorMessage = '';
      errorKeys.forEach(key => {
        errorMessage += ` ${err.error[key]}\n`;
      });

      this.alertSvc.presentAlert('Ooops', errorMessage);
    } else {
      this.alertSvc.presentAlert('Ooops', 'An unexpected error occurred.');
    };
  };

  closeModal(){
    this.close.emit(true);
  };


}
