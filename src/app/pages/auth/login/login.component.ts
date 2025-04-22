import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { Router } from '@angular/router';
import { AlertsService } from '../../../core/services/alerts.service';
import {LoginRequest} from "../../../core/models/auth.model";


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent  implements OnInit {
  public email:string = '';
  public password:string = '';
  public isLoading:boolean = false;
  public showPassword: boolean = false;

  constructor(
    private authSvc:AuthService,
    private router:Router,
    private alertSvc:AlertsService
  ) { }

  ngOnInit() {
    sessionStorage.clear();
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  login(){
    sessionStorage.clear();
    localStorage.clear();

    this.isLoading = !this.isLoading;

    const data: LoginRequest = {
      username: this.email,
      password: this.password
    };

    this.authSvc.login(data).subscribe({
      next: async (resp) => {
        this.authSvc.saveUserData(resp);
        await this.router.navigateByUrl('/home/profile/userInfo');
      },
      error:() => {
        this.alertSvc.presentAlert('Oooops', 'Credenciales incorrectas').then();
      },
      complete:() => {
        this.isLoading = !this.isLoading;
      }
    });
  };

}
