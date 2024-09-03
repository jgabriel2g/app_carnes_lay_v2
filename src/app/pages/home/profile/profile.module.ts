import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProfileRoutingModule } from './profile-routing.module';
import { UserInfoComponent } from './user-info/user-info.component';
import { ChangePasswordComponent } from './change-password/change-password.component';
import { UsersFormComponent } from '../../../shared/users-form/users-form.component';
import { IonicModule } from '@ionic/angular';


@NgModule({
  declarations: [
    UserInfoComponent,
    ChangePasswordComponent
  ],
  imports: [
    CommonModule,
    ProfileRoutingModule,
    UsersFormComponent,
    IonicModule
  ]
})
export class ProfileModule { }
