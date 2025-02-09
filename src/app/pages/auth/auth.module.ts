import { NgModule } from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';

import { AuthRoutingModule } from './auth-routing.module';
import { IonicModule } from '@ionic/angular';
import { LoginComponent } from './login/login.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
import { SubmitRecoverPasswordCodeComponent } from './submit-recover-password-code/submit-recover-password-code.component';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    LoginComponent,
    ResetPasswordComponent,
    SubmitRecoverPasswordCodeComponent
  ],
    imports: [
        CommonModule,
        AuthRoutingModule,
        IonicModule,
        FormsModule,
        NgOptimizedImage
    ]
})
export class AuthModule { }
