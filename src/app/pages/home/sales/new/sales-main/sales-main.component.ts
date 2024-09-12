import { Component, HostListener, OnInit } from '@angular/core';
import { SalesService } from '../../../../../core/services/sales.service';
import { Router } from '@angular/router';
import { AlertsService } from '../../../../../core/services/alerts.service';




@Component({
  selector: 'app-sales-main',
  templateUrl: './sales-main.component.html',
  styleUrls: ['./sales-main.component.scss'],
})
export class SalesMainComponent  implements OnInit {


  public windowWith:any;
  public isColapsed:boolean = false

  public boxInfo:any;


  constructor(private alertSvc:AlertsService, private salesSvc:SalesService, private router:Router) {
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
  }


  handleError(err: any) {
    if (err.error) {
      // Obtenemos todas las claves (nombres de los campos)
      const errorKeys = Object.keys(err.error);

      // Creamos un mensaje para la alerta con todos los errores
      let errorMessage = '';
      errorKeys.forEach(key => {
        // Concatenamos el nombre del campo y el mensaje de error
        errorMessage += ` ${err.error[key]}\n`;
      });

      // Mostrar alerta con el mensaje de error concatenado
      this.alertSvc.presentAlert('Ooops', errorMessage);
    } else {
      // Si no hay errores específicos en err.error, mostrar un mensaje general
      this.alertSvc.presentAlert('Ooops', 'An unexpected error occurred.');
    };
  };

}
