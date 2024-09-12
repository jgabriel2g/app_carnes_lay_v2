import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { AlertsService } from '../../../core/services/alerts.service';
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent  implements OnInit {
  public email:string = 'josemanuel';
  public password:string = 'demodemo123';
  public isLoading:boolean = false;

  constructor(private authSvc:AuthService, private router:Router, private alertSvc:AlertsService) { }

  ngOnInit() {
    sessionStorage.clear();
  }

  login(){
    this.isLoading = !this.isLoading;
    const data = {
      "username": this.email,
      "password": this.password
    };

    this.authSvc.login(data)
        .subscribe({
          error:(err:any) => {
            this.alertSvc.presentAlert('Oooops', 'Credenciales incorrectas')
          },
          next:(resp:any) => {
            sessionStorage.setItem('accessToken', resp.access);
            sessionStorage.setItem('refreshToken', resp.refresh);
            sessionStorage.setItem('userGroup', resp.user.groups);
            this.router.navigateByUrl('/home');
          }
        })
  };


}
