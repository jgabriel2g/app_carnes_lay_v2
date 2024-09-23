import { Component, HostListener, OnInit } from '@angular/core';
import { SalesService } from '../../../../../core/services/sales.service';
import { Router } from '@angular/router';
import { AlertsService } from '../../../../../core/services/alerts.service';
import { AuthService } from '../../../../../core/services/auth.service';

@Component({
  selector: 'app-sales-main',
  templateUrl: './sales-main.component.html',
  styleUrls: ['./sales-main.component.scss'],
})
export class SalesMainComponent  implements OnInit {
  public windowWith:any;
  public isColapsed:boolean = false
  public boxInfo:any;

  constructor(public authSvc:AuthService, private alertSvc:AlertsService, private salesSvc:SalesService, private router:Router) {
    this.checkScreenWidth(); // Verifica el ancho inicial
  }

  ngOnInit() {
      this.checkScreenWidth();
      setTimeout(() => this.checkScreenWidth(), 0);
      this.getBoxSalesById();
  };



  getBoxSalesById(){
    this.boxInfo = JSON.parse(sessionStorage.getItem('saleBoxInfo') || '')
    this.salesSvc.getBoxSaleById(this.boxInfo.id)
          .subscribe({
            error:(err:any) => {
              console.log(err)
            },
            next:(resp:any) => {
              this.boxInfo = resp;
            }
          });
  };

  closeBox(){
    const box = JSON.parse(sessionStorage.getItem('saleBoxInfo') || '')
    this.salesSvc.closeBoxSale(box.id)
        .subscribe({
          error:(err:any) => {
            console.log(err);
          },
          next:(resp:any) => {
            this.router.navigateByUrl('/home/sales/new/');
          }
        });
  };

  checkScreenWidth() {
    this.windowWith = window.innerWidth;
  };


  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenWidth();
  };

  reloadBoxInfo(event:any) {
    this.getBoxSalesById();
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

}
