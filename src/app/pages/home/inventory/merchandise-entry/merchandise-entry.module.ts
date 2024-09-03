import { MerchandiseEntryFormComponent } from './../../../../shared/merchandise-entry-form/merchandise-entry-form.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';

import { MerchandiseEntryRoutingModule } from './merchandise-entry-routing.module';
import { ListComponent } from './list/list.component';
import { CreateComponent } from './create/create.component';
import { OpenMerchEntryAlertComponent } from 'src/app/shared/open-merch-entry-alert/open-merch-entry-alert.component';

import { AutoCompleteModule } from 'primeng/autocomplete';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
@NgModule({
  declarations: [
    ListComponent,
    CreateComponent
  ],
  imports: [
    CommonModule,
    MerchandiseEntryRoutingModule,
    OpenMerchEntryAlertComponent,
    AutoCompleteModule,
    FormsModule,
    MerchandiseEntryFormComponent,
    IonicModule
  ],

})
export class MerchandiseEntryModule { }
