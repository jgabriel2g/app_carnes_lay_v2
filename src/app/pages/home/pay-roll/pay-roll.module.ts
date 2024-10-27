import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PayRollRoutingModule } from './pay-roll-routing.module';
import { ListComponent } from './list/list.component';
import { CreateComponent } from './create/create.component';
import { UpdateComponent } from './update/update.component';
import { EmployeeFormComponent } from '../../../shared/employee-form/employee-form.component';
import { IonicModule } from '@ionic/angular';


@NgModule({
  declarations: [
    ListComponent,
    CreateComponent,
    UpdateComponent
  ],
  imports: [
    CommonModule,
    PayRollRoutingModule,
    EmployeeFormComponent,
    IonicModule
  ]
})
export class PayRollModule { }
