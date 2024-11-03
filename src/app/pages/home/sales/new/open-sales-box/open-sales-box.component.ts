import { Component, OnInit } from '@angular/core';
import { SalesService } from '../../../../../core/services/sales.service';
import { Router } from '@angular/router';
import { AlertsService } from '../../../../../core/services/alerts.service';
import { AuthService } from '../../../../../core/services/auth.service';

@Component({
  selector: 'app-open-sales-box',
  templateUrl: './open-sales-box.component.html',
  styleUrls: ['./open-sales-box.component.scss'],
})
export class OpenSalesBoxComponent  implements OnInit {
  public isLoading:boolean = true;
  public boxInitMoney:number = 0;
  constructor(public authSvc:AuthService, private alertSvc:AlertsService, private salesSvc:SalesService, private router:Router) { }

  ngOnInit() {
    this.getSalesBox();
  }

  getSalesBox(){
    const saleBox = sessionStorage.getItem('saleBoxInfo')
    if (saleBox){
      this.router.navigateByUrl('/home/sales/new/salesMain/1').then();
    }
    this.salesSvc.getMyBoxSales().subscribe({
      error:(err:any) => {this.isLoading = false},
      next:(resp:any) => {
        this.isLoading = false;
        if (Array.isArray(resp) && resp.length > 0 && resp[0].is_open) {
          sessionStorage.setItem('saleBoxInfo', JSON.stringify(resp[0]));
          this.router.navigateByUrl('/home/sales/new/salesMain/1').then();
        }
      }
    });
  };

  openSalesBox(){
    if (this.boxInitMoney <= 0 ) {
      this.alertSvc.presentAlert('Ooops', 'Debes ingresar un monto de inicio').then();
    } else {
      this.isLoading = true;
      const data = {
        base_money: this.boxInitMoney
      };
      this.salesSvc.createNewBoxSale(data)
      .subscribe({
        error:(err:any) => {
          this.isLoading = false;
        },
        next:(resp:any) => {
          sessionStorage.setItem('saleBoxInfo', JSON.stringify(resp));
          this.router.navigateByUrl('/home/sales/new/salesMain/1').then();
          this.isLoading = false;
        }
      });
    }
  };

  handleError(err: any) {
    if (err.error) {
      const errorKeys = Object.keys(err.error);

      let errorMessage = '';
      errorKeys.forEach(key => {
        errorMessage += ` ${err.error[key]}\n`;
      });

      this.alertSvc.presentAlert('Ooops', errorMessage).then();
      return
    } else {
      this.alertSvc.presentAlert('Ooops', 'An unexpected error occurred.').then();
    }
  };

}
