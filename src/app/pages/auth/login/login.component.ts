import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { AlertsService } from '../../../core/services/alerts.service';


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent  implements OnInit {
  public email:string = '';
  public password:string = '';
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
            this.alertSvc.presentAlert('Oooops', 'Credenciales incorrectas').then()
          },
          next:(resp:any) => {
            sessionStorage.setItem('accessToken', resp.access);
            sessionStorage.setItem('refreshToken', resp.refresh);
            sessionStorage.setItem('userName', resp.user.first_name);
            sessionStorage.setItem('userGroup', JSON.stringify(resp.user.groups));
            this.router.navigateByUrl('/home/profile/userInfo').then();
          }
        })
  };


}
