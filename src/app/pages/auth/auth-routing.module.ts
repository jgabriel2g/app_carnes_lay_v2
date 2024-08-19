import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { RecoverPasswordComponent } from './recover-password/recover-password.component';
import { SubmitRecoverPasswordCodeComponent } from './submit-recover-password-code/submit-recover-password-code.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';

const routes: Routes = [
  {
    path:'login',
    component: LoginComponent
  },
  {
    path:'recoverPassword',
    component: RecoverPasswordComponent
  },
  {
    path:'recoverPasswordCode',
    component: SubmitRecoverPasswordCodeComponent
  },
  {
    path:'resetPassword',
    component: ResetPasswordComponent
  },
  {
    path:'**',
    pathMatch:'full',
    redirectTo:'login'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
