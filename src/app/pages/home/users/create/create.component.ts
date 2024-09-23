import { Component, HostListener, OnInit } from '@angular/core';
import { UsersService } from '../../../../core/services/users.service';
import { Router } from '@angular/router';
import { AlertsService } from '../../../../core/services/alerts.service';

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

  constructor(private alertSvc:AlertsService,  private userSvc:UsersService, private router:Router) {
    this.checkScreenWidth();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenWidth();
  }

  checkScreenWidth() {
    this.windowWith = window.innerWidth
  };

  newUser(event:any){
    this.userSvc.createUsers(event)
        .subscribe({
          error:(err:any) =>{
            this.handleError(err);
          },
          next:(resp:any) => {
            this.alertSvc.presentAlert('Éxito', 'Usuario creado');
            this.router.navigateByUrl('/home/users');
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
