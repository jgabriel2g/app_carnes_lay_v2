import { Component, HostListener, OnInit } from '@angular/core';
import { InventoryService } from '../../../../../core/services/inventory.service';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertsService } from '../../../../../core/services/alerts.service';

@Component({
  selector: 'app-update',
  templateUrl: './update.component.html',
  styleUrls: ['./update.component.scss'],
})
export class UpdateComponent  implements OnInit {

  public windowWith:any;
  public isColapsed:boolean = false
  public productId:any;
  public productInfo:any;
  ngOnInit() {
    this.checkScreenWidth();
    this.activatedRoute.params.subscribe((params:any) => {
      this.productId = params.id;
    })
    this.productInfo = JSON.parse(sessionStorage.getItem('product')|| '');
  }

  constructor(private activatedRoute:ActivatedRoute, private inventorySvc:InventoryService, private router:Router, private alertSvc:AlertsService) {
    this.checkScreenWidth(); // Verifica el ancho inicial
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenWidth();
  }

  checkScreenWidth() {
    this.windowWith = window.innerWidth
  }

  updateProduct(event:any){
    this.inventorySvc.updateProduct(event, this.productId)
        .subscribe({
          error:(err:any) =>{
            this.handleError(err)
          },
          next:(resp:any) => {
            this.alertSvc.presentAlert('Éxito', 'Producto actualizado');
            this.router.navigateByUrl('/home/inventory/products');
          }
        });
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
    }
  }
}
