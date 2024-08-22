import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ListComponent } from './list/list.component';
import { CreateComponent } from './create/create.component';

const routes: Routes = [
  {
    path:'list',
    component:ListComponent
  },
  {
    path:'create',
    component:CreateComponent
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
