import { Component, HostListener, OnInit } from '@angular/core';
import { InventoryService } from '../../../../../core/services/inventory.service';
import { AlertsService } from '../../../../../core/services/alerts.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss'],
})
export class CreateComponent  implements OnInit {

  public windowWith:any;

  constructor(private inventorySvc:InventoryService, private alertSvc:AlertsService, private router:Router) {
    this.checkScreenWidth();
  }

  ngOnInit() {
    this.checkScreenWidth();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenWidth();
  }

  checkScreenWidth() {
    this.windowWith = window.innerWidth;
  };

  createPurchaseInventory(data:{}){
    this.inventorySvc.purchaseStockDetail(data)
        .subscribe({
          error:(err:any) =>{
            console.log(err);
            this.handleError(err)
          },
          next:(resp:any) => {
            console.log(resp);
            this.alertSvc.presentAlert('Éxito', 'Cargue de mercancía creado').then();
            this.router.navigateByUrl('/home/inventory/merchandiseEntry/list').then();
          }
        })
  }

  handleError(err: any) {
    if (err.error) {
      const errorKeys = Object.keys(err.error);
      let errorMessage = '';
      errorKeys.forEach(key => {
        errorMessage += ` ${err.error[key]}\n`;
      });
      this.alertSvc.presentAlert('Ooops', errorMessage).then();
    } else {
      this.alertSvc.presentAlert('Ooops', 'An unexpected error occurred.').then();
    }
  }

}
