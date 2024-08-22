import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';


const routes: Routes = [
  {
    path: 'products',
    loadChildren: () => import('./products/products.module').then( m => m.ProductsModule)
  },
  {
    path: 'merchandiseEntry',
    loadChildren: () => import('./merchandise-entry/merchandise-entry.module').then( m => m.MerchandiseEntryModule)
  },
  {
    path:'**',
    redirectTo:'products',
    pathMatch:'full'
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InventoryRoutingModule { }
