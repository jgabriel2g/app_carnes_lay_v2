import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoleGuard } from 'src/app/core/guards/role.guard';
import { ListComponent } from './list/list.component';

const routes: Routes = [
  {
    path:'list',
    component: ListComponent,
    canActivate:[RoleGuard],
    data: {
      permissions:[
        'view-sales-tracking'
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
export class TrackingRoutingModule { }
