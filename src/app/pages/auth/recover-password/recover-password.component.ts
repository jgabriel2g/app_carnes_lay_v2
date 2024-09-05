import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { AlertsService } from '../../../core/services/alerts.service';

@Component({
  selector: 'app-recover-password',
  templateUrl: './recover-password.component.html',
  styleUrls: ['./recover-password.component.scss'],
})
export class RecoverPasswordComponent  implements OnInit {
  public email:string = '';

  constructor(private authSvc:AuthService, private router:Router, private alertSvc:AlertsService) { }

  ngOnInit() {}

  resetPassword(){
    const data = {
      email:this.email
    };

    this.authSvc.resetPassword(data)
          .subscribe({
            error:(err:any) => {
              console.log(err)
              this.alertSvc.presentAlert('Oooops', err?.error?.email);
            },
            next:(resp:any) =>{
               this.alertSvc.presentAlert('Recupera tu contraseña', resp.detail);
              console.log(resp)
              //
              this.router.navigateByUrl('/auth/recoverPasswordCode')
             }
          })
  }

}
