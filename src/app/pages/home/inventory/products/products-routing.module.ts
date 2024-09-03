import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateComponent } from './create/create.component';
import { ListComponent } from './list/list.component';
import { UpdateComponent } from './update/update.component';
import { StockComponent } from './stock/stock.component';

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
    path:'update/:id',
    component:UpdateComponent
  },
  {
    path:'stock/:id',
    component:StockComponent
  },
  {
    path:'**',
    redirectTo:'list',
    pathMatch:'full'
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProductsRoutingModule { }
