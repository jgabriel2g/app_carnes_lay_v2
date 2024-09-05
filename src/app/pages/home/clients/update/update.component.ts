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
  public ClientId:any;
  public ClientInfo:any;
  public isColapsed:boolean = false

  ngOnInit() {
    this.checkScreenWidth();
      this.checkScreenWidth();
      this.activatedRoute.params.subscribe((params:any) => {
        this.ClientId = params.id;
      })
      this.ClientInfo = JSON.parse(sessionStorage.getItem('client')|| '');
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

  updateClient(event:any){
    this.thirdPartySvc.updateClient(event, this.ClientId)
        .subscribe({
          error:(err:any) =>{
            console.log(err);
            this.handleError(err)
          },
          next:(resp:any) => {
            console.log(resp);
            this.alertSvc.presentAlert('Éxito', 'Cliente actualizado');
            this.router.navigateByUrl('/home/clients');
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
