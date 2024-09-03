import { Component, HostListener, OnInit } from '@angular/core';

@Component({
  selector: 'app-user-info',
  templateUrl: './user-info.component.html',
  styleUrls: ['./user-info.component.scss'],
})
export class UserInfoComponent  implements OnInit {

  public windowWith:any;

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
