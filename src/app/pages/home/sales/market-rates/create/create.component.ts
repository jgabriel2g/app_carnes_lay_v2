import { Component, HostListener, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertsService } from 'src/app/core/services/alerts.service';
import { PayRollService } from 'src/app/core/services/pay-roll.service';
import { MarketRatesService } from '../../../../../core/services/market-rates.service';

@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss'],
})
export class CreateComponent  implements OnInit {


    public windowWith:any;
    public isColapsed:boolean = false

    ngOnInit() {
      this.checkScreenWidth();
    }

    constructor(private alertSvc:AlertsService,  private marketRateSvc:MarketRatesService, private router:Router) {
      this.checkScreenWidth();
    }

    @HostListener('window:resize', ['$event'])
    onResize(event: any) {
      this.checkScreenWidth();
    }

    checkScreenWidth() {
      this.windowWith = window.innerWidth
    };

    newMarketRate(event:any){
      this.marketRateSvc.newMarketRate(event)
          .subscribe({
            error:(err:any) =>{
              this.handleError(err);
            },
            next:(resp:any) => {
              this.alertSvc.presentAlert('Éxito', 'Cotización creada');
              this.router.navigateByUrl('/home/sales/market-rates');
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
