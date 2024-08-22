import { Component, HostListener, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.scss'],
  standalone:true,
  imports:[
    CommonModule,
    RouterModule
  ]
})
export class SideBarComponent  implements OnInit {

    public windowWith:any;
    public showInventoryMenu:boolean = false;
    ngOnInit() {
      this.checkScreenWidth();

    }
    public isColapsed:boolean = false


    constructor() {
      this.checkScreenWidth(); // Verifica el ancho inicial
    }

    @HostListener('window:resize', ['$event'])
    onResize(event: any) {
      this.checkScreenWidth();
    }

    checkScreenWidth() {

      this.windowWith = window.innerWidth
    }

}
