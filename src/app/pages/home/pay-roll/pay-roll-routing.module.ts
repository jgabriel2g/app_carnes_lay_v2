import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoleGuard } from 'src/app/core/guards/role.guard';
import { CreateComponent } from './create/create.component';
import { ListComponent } from './list/list.component';
import { UpdateComponent } from './update/update.component';

const routes: Routes = [
  {
    path:'list',
    component:ListComponent,
    canActivate:[RoleGuard],
    data:{
      permissions:['manage-employees']
    }
  },
  {
    path:'create',
    component:CreateComponent,
    canActivate:[RoleGuard],
    data:{
      permissions:['manage-employees']
    }
  },
  {
    path:'update/:id',
    component:UpdateComponent,
    canActivate:[RoleGuard],
    data:{
      permissions:['manage-employees']
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
export class PayRollRoutingModule { }
