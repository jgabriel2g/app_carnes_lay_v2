import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProductsRoutingModule } from './products-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { DeleteAlertComponent } from 'src/app/shared/delete-alert/delete-alert.component';
import { InventoryFormComponent } from 'src/app/shared/inventory-form/inventory-form.component';
import { ListComponent } from './list/list.component';
import { UpdateComponent } from './update/update.component';
import { CreateComponent } from './create/create.component';
import { StockComponent } from './stock/stock.component';
import { DetailsComponent } from './details/details.component';


@NgModule({
  declarations: [
    ListComponent,
    UpdateComponent,
    CreateComponent,
    StockComponent,
    DetailsComponent
  ],
  imports: [
    CommonModule,
    ProductsRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    InventoryFormComponent,
    DeleteAlertComponent,
    IonicModule
  ]
})
export class ProductsModule { }
