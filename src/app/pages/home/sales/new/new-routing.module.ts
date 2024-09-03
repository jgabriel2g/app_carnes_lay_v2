import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OpenSalesBoxComponent } from './open-sales-box/open-sales-box.component';
import { SalesMainComponent } from './sales-main/sales-main.component';

const routes: Routes = [
    {
      path:'openSalesBox',
      component: OpenSalesBoxComponent
    },
    {
      path:'salesMain/:boxId',
      component: SalesMainComponent
    },
    {
      path:'**',
      redirectTo:'openSalesBox',
      pathMatch:'full'
    }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NewRoutingModule { }
