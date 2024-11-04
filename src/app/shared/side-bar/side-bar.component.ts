import { Component, EventEmitter, HostListener, OnInit, Output } from '@angular/core';
import {CommonModule, NgOptimizedImage} from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.scss'],
  standalone:true,
  imports: [
    CommonModule,
    RouterModule,
    NgOptimizedImage
  ]
})
export class SideBarComponent  implements OnInit {
  @Output() close = new EventEmitter<boolean>();

  public windowWith:any;
  public showInventoryMenu:boolean = false;
  public showSalesMenu:boolean = false;
  public isColapsed:boolean = false
  ngOnInit() {
    this.checkScreenWidth();
  }

  constructor(public authSvc:AuthService) {
    this.checkScreenWidth(); // Verifica el ancho inicial
  };

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenWidth();
  };

  checkScreenWidth() {
    this.windowWith = window.innerWidth;
  };

  toCollapse(){
    this.isColapsed = !this.isColapsed;
      this.close.emit(this.isColapsed);
  };

}
