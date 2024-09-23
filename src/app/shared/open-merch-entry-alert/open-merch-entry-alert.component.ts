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
  public showInventoryMenu:boolean = false;
  ngOnInit(): void {
    this.getProviders();
  }

  constructor(private thirdPartySvc:ThirdPartyService,  private inventorySvc:InventoryService, private alertSvc:AlertsService,) { }

  actionResponse(value:boolean) {
    this.close.emit({value, providerId:this.providerId});
  };

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
