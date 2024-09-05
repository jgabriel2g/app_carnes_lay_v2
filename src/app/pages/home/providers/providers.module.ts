import { NgModule, createComponent } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProvidersRoutingModule } from './providers-routing.module';
import { ProvidersFormComponent } from '../../../shared/providers-form/providers-form.component';
import { ListComponent } from './list/list.component';
import { CreateComponent } from './create/create.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { UpdateComponent } from './update/update.component';


@NgModule({
  declarations: [
    ListComponent,
    CreateComponent,
    UpdateComponent
  ],
  imports: [
    CommonModule,
    ProvidersRoutingModule,
    ProvidersFormComponent,
    FormsModule,
    RouterModule,
    ReactiveFormsModule,
    IonicModule
  ]
})
export class ProvidersModule { }
