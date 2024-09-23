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

  ngOnInit() {
    this.checkScreenWidth();
  }

  constructor(private router:Router, private alertSvc:AlertsService, private inventorySvc:InventoryService) {
    this.checkScreenWidth(); // Verifica el ancho inicial
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenWidth();
  };

  checkScreenWidth() {
    this.windowWith = window.innerWidth;
  };

  createProduct(event:any){
      this.inventorySvc.newProduct(event)
            .subscribe({
              error:(err:any) =>{
                this.handleError(err)
              },
              next:(resp:any) => {
                this.alertSvc.presentAlert('Éxito', 'Producto creado');
                this.router.navigateByUrl('/home/inventory/products');
              }
            });
  };

  handleError(err: any) {
    if (err.error) {
      const errorKeys = Object.keys(err.error);

      let errorMessage = '';
      errorKeys.forEach(key => {
      });

      this.alertSvc.presentAlert('Ooops', errorMessage);
    } else {
      this.alertSvc.presentAlert('Ooops', 'An unexpected error occurred.');
    };
  };

}
