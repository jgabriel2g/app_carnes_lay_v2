import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { UserInfoComponent } from './user-info/user-info.component';
import { ChangePasswordComponent } from './change-password/change-password.component';

const routes: Routes = [
  {
    path: 'userInfo',
    component: UserInfoComponent
  },
  {
    path:'changePassword',
    component: ChangePasswordComponent
  },
  {
    path:'**',
    pathMatch:'full',
    redirectTo:'userInfo'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProfileRoutingModule { }
