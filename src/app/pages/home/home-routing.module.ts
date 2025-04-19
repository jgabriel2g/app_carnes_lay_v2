import { NgModule } from '@angular/core';
import { RouterModule, Routes, CanActivate } from '@angular/router';
import { MainComponent } from './main/main.component';
import { RoleGuard } from '../../core/guards/role.guard';

const routes: Routes = [
  {
    path: '',
    component: MainComponent,
    children: [
      {
        path: 'users',
        loadChildren: () =>
          import('../../pages/home/users/users.module').then(
            (m) => m.UsersModule
          ),
        canActivate: [RoleGuard],
        data: {
          permissions: ['view-users'],
        },
      },
      {
        path: 'sales',
        loadChildren: () =>
          import('../../pages/home/sales/sales.module').then(
            (m) => m.SalesModule
          ),
        canActivate: [RoleGuard],
        data: {
          permissions: ['view-sales-module'],
        },
      },
      {
        path: 'inventory',
        loadChildren: () =>
          import('../../pages/home/inventory/inventory.module').then(
            (m) => m.InventoryModule
          ),
        canActivate: [RoleGuard],
        data: {
          permissions: ['view-module-inventory'],
        },
      },
      {
        path: 'profile',
        loadChildren: () =>
          import('../../pages/home/profile/profile.module').then(
            (m) => m.ProfileModule
          ),
      },
      {
        path: 'providers',
        loadChildren: () =>
          import('../../pages/home/providers/providers.module').then(
            (m) => m.ProvidersModule
          ),
        canActivate: [RoleGuard],
        data: {
          permissions: ['manage-providers'],
        },
      },
      {
        path: 'clients',
        loadChildren: () =>
          import('../../pages/home/clients/clients.module').then(
            (m) => m.ClientsModule
          ),
        canActivate: [RoleGuard],
        data: {
          permissions: ['manage-clients'],
        },
      },
      {
        path: 'pay-roll',
        loadChildren: () =>
          import('../../pages/home/pay-roll/pay-roll.module').then(
            (m) => m.PayRollModule
          ),
        canActivate: [RoleGuard],
        data: {
          permissions: ['manage-employees'],
        },
      },
      {
        path: 'metricas',
        loadChildren: () =>
          import('../../pages/home/metricas/metricas.module').then(
            (m) => m.MetricasModule
          ),
        canActivate: [RoleGuard],
        data: {
          permissions: ['view-users'],
        },
      },
      {
        path: '**',
        pathMatch: 'full',
        redirectTo: 'users',
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class HomeRoutingModule {}
