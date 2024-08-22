import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MerchandiseEntryRoutingModule } from './merchandise-entry-routing.module';
import { ListComponent } from './list/list.component';
import { CreateComponent } from './create/create.component';
import { OpenMerchEntryAlertComponent } from 'src/app/shared/open-merch-entry-alert/open-merch-entry-alert.component';


@NgModule({
  declarations: [
    ListComponent,
    CreateComponent
  ],
  imports: [
    CommonModule,
    MerchandiseEntryRoutingModule,
    OpenMerchEntryAlertComponent
  ]
})
export class MerchandiseEntryModule { }
