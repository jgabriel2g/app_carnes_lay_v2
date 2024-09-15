import { Component, OnInit } from '@angular/core';
import { SalesService } from '../../../../../core/services/sales.service';
import { Router } from '@angular/router';
import { AlertsService } from '../../../../../core/services/alerts.service';

@Component({
  selector: 'app-open-sales-box',
  templateUrl: './open-sales-box.component.html',
  styleUrls: ['./open-sales-box.component.scss'],
})
export class OpenSalesBoxComponent  implements OnInit {
  public isLoading:boolean = true;
  public boxInitMoney:number = 0;
  constructor(private alertSvc:AlertsService, private salesSvc:SalesService, private router:Router) { }

  ngOnInit() {
    this.getSalesBox();
  }

  getSalesBox(){
    this.salesSvc.getBoxSales()
        .subscribe({
          error:(err:any) => {
            console.log(err);
            this.isLoading = false;
          },
          next:(resp:any) => {
            console.log(resp)
            this.isLoading = false;
            if (resp.results[0].is_open) {
              sessionStorage.setItem('saleBoxInfo', JSON.stringify(resp.results[0]));
              this.router.navigateByUrl('/home/sales/new/salesMain/1');
            }
          }
        });
  };

  openSalesBox(){
    if (this.boxInitMoney <= 0 ) {
      this.alertSvc.presentAlert('Ooops', 'Debes ingresar un monto de inicio');
    } else {

      this.isLoading = true;
      const data = {
        base_money: this.boxInitMoney
      };

      this.salesSvc.createNewBoxSale(data)
      .subscribe({
        error:(err:any) => {
          console.log(err);
          this.isLoading = false;
        },
        next:(resp:any) => {
          sessionStorage.setItem('saleBoxInfo', JSON.stringify(resp));
          this.router.navigateByUrl('/home/sales/new/salesMain/1');
          this.isLoading = false;
        }
      });
    }
  };

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
