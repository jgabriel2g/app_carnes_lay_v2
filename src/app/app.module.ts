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
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [AppComponent, TicketComponent],
  imports: [BrowserModule,CommonModule, IonicModule.forRoot(), AppRoutingModule],
  providers: [ {
    provide: HTTP_INTERCEPTORS,
    useClass: AuthInterceptor,
    multi: true
  },
  provideHttpClient(), { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },provideAnimations() ],
  bootstrap: [AppComponent],
})
export class AppModule {}
