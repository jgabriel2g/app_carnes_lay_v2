import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeRoutingModule } from './home-routing.module';
import { MainComponent } from './main/main.component';
import { IonicModule } from '@ionic/angular';
import { MobileMenuComponent } from '../../shared/mobile-menu/mobile-menu.component';


@NgModule({
  declarations: [
    MainComponent
  ],
  imports: [
    CommonModule,
    HomeRoutingModule,
    IonicModule,
    MobileMenuComponent
  ]
})
export class HomeModule { }
