import { Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertsService } from 'src/app/core/services/alerts.service';
import { ThirdPartyService } from 'src/app/core/services/third-party.service';

@Component({
  selector: 'app-update',
  templateUrl: './update.component.html',
  styleUrls: ['./update.component.scss'],
})
export class UpdateComponent  implements OnInit {
  public windowWith:any;
  public isColapsed:boolean = false;

  public providerId:any;
  public providerInfo:any;

  ngOnInit() {
    this.checkScreenWidth();
    this.activatedRoute.params.subscribe((params:any) => {
      this.providerId = params.id;
    })
    this.providerInfo = JSON.parse(sessionStorage.getItem('provider')|| '');
  }

  constructor(private activatedRoute:ActivatedRoute,private alertSvc:AlertsService,  private thirdPartySvc:ThirdPartyService, private router:Router) {
    this.checkScreenWidth();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenWidth();
  }

  checkScreenWidth() {
    this.windowWith = window.innerWidth
  };

  updateProvider(event:any){
    this.thirdPartySvc.updateProvider(event, this.providerId)
        .subscribe({
          error:(err:any) =>{
            this.handleError(err)
          },
          next:(resp:any) => {
            this.alertSvc.presentAlert('Éxito', 'Proveedor actualizado');
            this.router.navigateByUrl('/home/providers');
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
    }
  }
}
