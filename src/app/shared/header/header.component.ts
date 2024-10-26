import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MobileMenuComponent } from '../mobile-menu/mobile-menu.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  standalone:true,
  imports:[
    CommonModule,
    RouterModule,
    MobileMenuComponent
  ]
})
export class HeaderComponent  implements OnInit {
  public showMobileMenu:boolean = false;
  public showProfileMenu:boolean = false;
  public userName:string = '';
  constructor() { }

  ngOnInit() {
    this.userName = sessionStorage.getItem('userName') || '';
  }

  closeMobileMenu(event:any) {
    this.showMobileMenu = !this.showMobileMenu;
  }
}
