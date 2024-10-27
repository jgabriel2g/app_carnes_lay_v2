import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoleGuard } from 'src/app/core/guards/role.guard';
import { ListComponent } from './list/list.component';
import { CreateComponent } from './create/create.component';

const routes: Routes = [
  {
    path:'list',
    component:ListComponent,
    canActivate:[RoleGuard],
       data: {
         permissions:[
           'view-market-rates'
         ]
       }
  },
  {
    path:'create',
    component:CreateComponent,
    canActivate:[RoleGuard],
       data: {
         permissions:[
           'create-market-rates'
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
export class MarketRatesRoutingModule { }
