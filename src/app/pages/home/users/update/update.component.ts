import { Component, HostListener, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertsService } from 'src/app/core/services/alerts.service';
import { UsersService } from 'src/app/core/services/users.service';

@Component({
  selector: 'app-update',
  templateUrl: './update.component.html',
  styleUrls: ['./update.component.scss'],
})
export class UpdateComponent  implements OnInit {
  public windowWith:any;
  public isColapsed:boolean = false
  public userId:any;
  public userInfo:any;
  ngOnInit() {
    this.checkScreenWidth();
    this.activatedRoute.params.subscribe((params:any) => {
      this.userId = params.id;
    })
    this.userInfo = JSON.parse(sessionStorage.getItem('user')|| '');
  }

  constructor(private activatedRoute:ActivatedRoute, private alertSvc:AlertsService,  private userSvc:UsersService, private router:Router) {
    this.checkScreenWidth();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenWidth();
  }

  checkScreenWidth() {
    this.windowWith = window.innerWidth
  };

  updateUser(event:any){
    this.userSvc.updateUsers(event, this.userId )
        .subscribe({
          error:(err:any) =>{
              console.log(err);
              this.alertSvc.presentAlert('','')
            },
            next:(resp:any) => {
              console.log(resp);
              this.alertSvc.presentAlert('Éxito', 'Usuario actualizado');
              this.router.navigateByUrl('/home/users');
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
