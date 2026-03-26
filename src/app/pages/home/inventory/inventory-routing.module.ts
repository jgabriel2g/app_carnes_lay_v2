import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoleGuard } from '../../../core/guards/role.guard';


const routes: Routes = [
  {
    path: 'products',
    loadChildren: () => import('./products/products.module').then( m => m.ProductsModule),
    canActivate:[RoleGuard],
    data: {
      permissions:[
        'view-product'
      ]
    }
  },
  {
    path:'**',
    redirectTo:'',
    pathMatch:'full',
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InventoryRoutingModule { }
