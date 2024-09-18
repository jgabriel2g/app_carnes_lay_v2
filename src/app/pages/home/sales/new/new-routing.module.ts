import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoleGuard } from 'src/app/core/guards/role.guard';
import { OpenSalesBoxComponent } from './open-sales-box/open-sales-box.component';
import { SalesMainComponent } from './sales-main/sales-main.component';

const routes: Routes = [
    {
      path:'openSalesBox',
      component: OpenSalesBoxComponent,
       canActivate:[RoleGuard],
       data: {
         permissions:[
           'open-sales-box'
         ]
       }
    },
    {
      path:'salesMain/:boxId',
      component: SalesMainComponent,
      canActivate:[RoleGuard],
      data: {
        permissions:[
          'create-sales'
        ]
      }
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
