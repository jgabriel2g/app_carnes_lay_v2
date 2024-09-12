import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { StockRoutingModule } from './stock-routing.module';
import { LoadNewComponent } from './load-new/load-new.component';
import { ListComponent } from './list/list.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { AutoCompleteModule } from 'primeng/autocomplete';


@NgModule({
  declarations: [
    LoadNewComponent,
    ListComponent
  ],
  imports: [
    CommonModule,
    StockRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    AutoCompleteModule
  ]
})
export class StockModule { }
