import { createComponent, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { UsersRoutingModule } from './users-routing.module';
import { ListComponent } from './list/list.component';
import { FormComponent } from './form/form.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { CreateComponent } from './create/create.component';
import { UpdateComponent } from './update/update.component';
import { RouterModule } from '@angular/router';


@NgModule({
  declarations: [
    ListComponent,
    FormComponent,
    CreateComponent,
    UpdateComponent
  ],
  imports: [
    CommonModule,
    UsersRoutingModule,
    FormsModule,
    IonicModule,
    RouterModule,
    ReactiveFormsModule

  ]
})
export class UsersModule { }
