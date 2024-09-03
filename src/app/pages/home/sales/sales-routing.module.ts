import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NewModule } from './new/new.module';

const routes: Routes = [
  {
    path: 'new',
    loadChildren: () => import('../sales/new/new.module').then( m => m.NewModule),
  },
  {
    path: 'tracking',
    loadChildren: () => import('../sales/tracking/tracking.module').then( m => m.TrackingModule),
  },
  {
    path: 'stock',
    loadChildren: () => import('../sales/stock/stock.module').then( m => m.StockModule),
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SalesRoutingModule { }
