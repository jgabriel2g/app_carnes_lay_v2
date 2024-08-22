import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HomeRoutingModule } from './home-routing.module';
import { MainComponent } from './main/main.component';
import { IonicModule } from '@ionic/angular';
import { MobileMenuComponent } from '../../shared/mobile-menu/mobile-menu.component';
import { SideBarComponent } from '../../shared/side-bar/side-bar.component';
import { HeaderComponent } from '../../shared/header/header.component';


@NgModule({
  declarations: [
    MainComponent
  ],
  imports: [
    CommonModule,
    HomeRoutingModule,
    IonicModule,
    HeaderComponent,
    SideBarComponent
  ]
})
export class HomeModule { }
