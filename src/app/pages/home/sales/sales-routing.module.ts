import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoleGuard } from 'src/app/core/guards/role.guard';

const routes: Routes = [
  {
    path: 'new',
    loadChildren: () => import('../sales/new/new.module').then( m => m.NewModule),
    canActivate:[RoleGuard],
    data: {
      permissions:[
        'view-sales-module'
      ]
    }
  },
  {
    path: 'tracking',
    loadChildren: () => import('../sales/tracking/tracking.module').then( m => m.TrackingModule),
    canActivate:[RoleGuard],
    data: {
      permissions:[
        'view-sales-tracking'
      ]
    }
  },
  {
    path: 'stock',
    loadChildren: () => import('../sales/stock/stock.module').then( m => m.StockModule),
    canActivate:[RoleGuard],
    data: {
      permissions:[
        'view-sales-stock'
      ]
    }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SalesRoutingModule { }
