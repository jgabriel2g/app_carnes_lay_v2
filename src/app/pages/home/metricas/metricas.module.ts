import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MetricasRoutingModule } from './metricas-routing.module';
import { MainComponent } from './main/main.component';
import { IonicModule } from '@ionic/angular';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    MetricasRoutingModule,
    IonicModule,
    MainComponent, // MainComponent es standalone
  ],
})
export class MetricasModule {}
