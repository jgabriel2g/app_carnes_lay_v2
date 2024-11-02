import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TrackingRoutingModule } from './tracking-routing.module';
import { ListComponent } from './list/list.component';
import { SaleBillsComponent } from './sale-bills/sale-bills.component';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    ListComponent,
    SaleBillsComponent
  ],
  imports: [
    CommonModule,
    TrackingRoutingModule,
    FormsModule
  ]
})
export class TrackingModule { }
