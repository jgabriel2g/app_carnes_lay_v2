import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ListComponent } from './list/list.component';
import { CreateComponent } from './create/create.component';
import { RoleGuard } from '../../../../core/guards/role.guard';

const routes: Routes = [
  {
    path:'list',
    component:ListComponent,
    canActivate:[RoleGuard],
    data: {
      permissions:[
        'view-merchandise-entry'
      ]
    }
  },
  {
    path:'create/:id',
    component:CreateComponent,
    data: {
      permissions:[
        'create-merchandise-entry'
      ]
    }
  },
  {
    path:'**',
    redirectTo:'list',
    pathMatch:'full'
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MerchandiseEntryRoutingModule { }
