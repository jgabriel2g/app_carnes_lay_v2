import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListComponent } from './list/list.component';
import { CreateComponent } from './create/create.component';
import { UpdateComponent } from './update/update.component';
import { RoleGuard } from 'src/app/core/guards/role.guard';

const routes: Routes = [
  {
    path:'list',
    component:ListComponent,
    canActivate:[RoleGuard],
      data: {
        permissions: ['manage-providers']
      }
  },
  {
    path:'create',
    component:CreateComponent,
    canActivate:[RoleGuard],
      data: {
        permissions: ['manage-providers']
      }
  },
  {
    path:'update/:id',
    component:UpdateComponent,
    canActivate:[RoleGuard],
      data: {
        permissions: ['manage-providers']
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
export class ProvidersRoutingModule { }
