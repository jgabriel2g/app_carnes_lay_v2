import { SalesFormComponent } from './../../../shared/sales-form/sales-form.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SalesRoutingModule } from './sales-routing.module';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { SalesMainComponent } from './new/sales-main/sales-main.component';


@NgModule({
  declarations: [

  ],
  imports: [
    CommonModule,
    SalesRoutingModule,
  ]
})
export class SalesModule { }
