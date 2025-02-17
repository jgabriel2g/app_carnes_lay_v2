import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';

import { IonicModule, IonicRouteStrategy } from '@ionic/angular';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { provideAnimations } from '@angular/platform-browser/animations';
import { HTTP_INTERCEPTORS, provideHttpClient } from '@angular/common/http';
import { AuthInterceptor } from './core/interceptors/refresh';
import { TicketComponent } from './pages/ticket/ticket.component';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import {DailyTicketComponent} from "./pages/daily-ticket/daily-ticket.component";
import { RewardTickedComponent } from './pages/reward-ticked/reward-ticked.component';

@NgModule({
  declarations: [AppComponent, TicketComponent, DailyTicketComponent, RewardTickedComponent],
    imports: [BrowserModule, CommonModule, IonicModule.forRoot(), AppRoutingModule, NgOptimizedImage],
  providers: [ {
    provide: HTTP_INTERCEPTORS,
    useClass: AuthInterceptor,
    multi: true
  },
  provideHttpClient(), { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },provideAnimations() ],
  bootstrap: [AppComponent],
})
export class AppModule {}
