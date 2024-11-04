import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';
import { TicketComponent } from './pages/ticket/ticket.component';
import {DailyTicketComponent} from "./pages/daily-ticket/daily-ticket.component";

const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./pages/auth/auth.module').then( m => m.AuthModule)
  },
  {
    path: 'home',
    loadChildren: () => import('./pages/home/home.module').then( m => m.HomeModule),
    canActivate:[AuthGuard]
  },
  {
    path: 'ticket',
    component: TicketComponent,
    canActivate:[AuthGuard]
  },
  {
    path: 'daily-ticket',
    component: DailyTicketComponent,
    canActivate:[AuthGuard]
  },
  {
    path: '',
    redirectTo: 'auth',
    pathMatch: 'full'
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
