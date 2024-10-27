import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MarketRatesRoutingModule } from './market-rates-routing.module';
import { CreateComponent } from './create/create.component';
import { ListComponent } from './list/list.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { MarketRatesFormComponent } from '../../../../shared/market-rates-form/market-rates-form.component';


@NgModule({
  declarations: [
    CreateComponent,
    ListComponent
  ],
  imports: [
    CommonModule,
    MarketRatesRoutingModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    MarketRatesFormComponent
  ]
})
export class MarketRatesModule { }
