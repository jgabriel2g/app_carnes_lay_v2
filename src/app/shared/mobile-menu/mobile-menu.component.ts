import { Component, EventEmitter, OnDestroy, OnInit, Output } from '@angular/core';
import { Router, ActivatedRoute, ActivationEnd, RouterModule } from '@angular/router';
import { Subscription, filter, map } from 'rxjs';
import { IonTabs } from "@ionic/angular/standalone";
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-mobile-menu',
  templateUrl: './mobile-menu.component.html',
  styleUrls: ['./mobile-menu.component.scss'],
  standalone: true,
  imports:[
    IonicModule,
    CommonModule,
    RouterModule
  ]
})
export class MobileMenuComponent    {
  @Output() close = new EventEmitter<boolean>();
  public showInventoryMenu:boolean = false;
  public showSalesMenu:boolean = false;

  constructor(public authSvc:AuthService){}

  actionResponse(value:boolean) {
    this.close.emit(value);
  }


}
