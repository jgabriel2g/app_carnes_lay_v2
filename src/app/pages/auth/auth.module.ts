import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthRoutingModule } from './auth-routing.module';
import { IonicModule } from '@ionic/angular';
import { LoginComponent } from './login/login.component';
import { RecoverPasswordComponent } from './recover-password/recover-password.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { SubmitRecoverPasswordCodeComponent } from './submit-recover-password-code/submit-recover-password-code.component';


@NgModule({
  declarations: [
    LoginComponent,
    RecoverPasswordComponent,
    ResetPasswordComponent,
    SubmitRecoverPasswordCodeComponent
  ],
  imports: [
    CommonModule,
    AuthRoutingModule,
    IonicModule
  ]
})
export class AuthModule { }
