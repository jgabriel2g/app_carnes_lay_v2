import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListComponent } from './list/list.component';
import { FormComponent } from './form/form.component';
import { CreateComponent } from './create/create.component';
import { UpdateComponent } from './update/update.component';
import { RoleGuard } from '../../../core/guards/role.guard';

const routes: Routes = [
  {
    path:'list',
    component:ListComponent,
    canActivate:[RoleGuard],
    data:{
      permissions:['view-users']
    }
  },
  {
    path:'create',
    component:CreateComponent,
    canActivate:[RoleGuard],
    data:{
      permissions:['create-users']
    }
  },
  {
    path:'update/:id',
    component:UpdateComponent,
    canActivate:[RoleGuard],
    data:{
      permissions:['edit-users']
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
export class UsersRoutingModule { }
