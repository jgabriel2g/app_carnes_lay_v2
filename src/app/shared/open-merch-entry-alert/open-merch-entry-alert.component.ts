import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertsService } from 'src/app/core/services/alerts.service';
import { InventoryService } from 'src/app/core/services/inventory.service';
import { ThirdPartyService } from 'src/app/core/services/third-party.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-open-merch-entry-alert',
  templateUrl: './open-merch-entry-alert.component.html',
  styleUrls: ['./open-merch-entry-alert.component.scss'],
  standalone:true,
  imports:[
    CommonModule,
    FormsModule
  ]
})
export class OpenMerchEntryAlertComponent  implements OnInit {
  @Output() close = new EventEmitter<any>();
  public Providers:any[] =[];
  public providerId:any = '';
  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.getProviders();
  }
  constructor(private thirdPartySvc:ThirdPartyService,  private inventorySvc:InventoryService, private alertSvc:AlertsService,) { }
  public showInventoryMenu:boolean = false;


  actionResponse(value:boolean) {
    this.close.emit({value, providerId:this.providerId});
  }

  getProviders(){
    this.thirdPartySvc.getProviders(1000, 0)
        .subscribe({
          error:(err:any) => {
          this.handleError(err);
          },
          next:(resp:any) => {
            this.Providers = resp.results;
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
    };
  };
}
