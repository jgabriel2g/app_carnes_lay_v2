import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MainComponent } from './main/main.component';

const routes: Routes = [
  {
    path:'',
    component: MainComponent ,
    children: [
      {
        path: 'users',
        loadChildren: () => import('../../pages/home/users/users.module').then( m => m.UsersModule),
        data: {route:'1'}
      },
      {
        path: 'sales',
        loadChildren: () => import('../../pages/home/sales/sales.module').then( m => m.SalesModule),
        data: {route:'2'}
      },
      {
        path: 'inventory',
        loadChildren: () => import('../../pages/home/inventory/inventory.module').then( m => m.InventoryModule),
        data: {route:'3'}
      },
      {
        path: 'profile',
        loadChildren: () => import('../../pages/home/profile/profile.module').then( m => m.ProfileModule),
        data: {route:'4'}
      },
      {
        path: 'providers',
        loadChildren: () => import('../../pages/home/providers/providers.module').then( m => m.ProvidersModule),
        data: {route:'4'}
      },
      {
        path: 'clients',
        loadChildren: () => import('../../pages/home/clients/clients.module').then( m => m.ClientsModule),
        data: {route:'4'}
      },
      {
        path:'**',
        pathMatch:'full',
        redirectTo:'users'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule { }
