import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreateComponent } from './create/create.component';
import { ListComponent } from './list/list.component';
import { UpdateComponent } from './update/update.component';
import { StockComponent } from './stock/stock.component';
import { RoleGuard } from 'src/app/core/guards/role.guard';

const routes: Routes = [
  {
    path:'list',
    component:ListComponent,
    canActivate:[RoleGuard],
    data: {
      permissions:[
        'view-product'
      ]
    }
  },
  {
    path:'create',
    component:CreateComponent,
    canActivate:[RoleGuard],
    data: {
      permissions:[
        'create-product'
      ]
    }
  },
  {
    path:'update/:id',
    component:UpdateComponent,
    canActivate:[RoleGuard],
    data: {
      permissions:[
        'edit-product'
      ]
    }
  },
  {
    path:'stock/:id',
    component:StockComponent,
    canActivate:[RoleGuard],
    data: {
      permissions:[
        'view-product'
      ]
    }
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
