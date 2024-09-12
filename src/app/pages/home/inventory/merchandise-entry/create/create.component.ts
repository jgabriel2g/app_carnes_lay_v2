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
  public isColapsed:boolean = false

  constructor(private inventorySvc:InventoryService, private alertSvc:AlertsService, private router:Router) {
    this.checkScreenWidth(); // Verifica el ancho inicial
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
            this.alertSvc.presentAlert('Éxito', 'Cargue de mercancía creado');
            this.router.navigateByUrl('/home/inventory/merchandiseEntry/list');
          }
        })
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
    }
  }

}
