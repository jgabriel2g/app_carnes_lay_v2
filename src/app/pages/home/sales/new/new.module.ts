import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { NewRoutingModule } from './new-routing.module';
import { OpenSalesBoxComponent } from './open-sales-box/open-sales-box.component';
import { SalesMainComponent } from './sales-main/sales-main.component';
import { SalesFormComponent } from '../../../../shared/sales-form/sales-form.component';
import { IonicModule } from '@ionic/angular';
import { LoaderComponent } from '../../../../shared/loader/loader.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    OpenSalesBoxComponent,
    SalesMainComponent
  ],
  imports: [
    CommonModule,
    NewRoutingModule,
    SalesFormComponent,
    IonicModule,
    LoaderComponent,
    ReactiveFormsModule,
    FormsModule
  ]
})
export class NewModule { }
