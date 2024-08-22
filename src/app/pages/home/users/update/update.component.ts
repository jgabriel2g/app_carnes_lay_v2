import { Component, HostListener, OnInit } from '@angular/core';

@Component({
  selector: 'app-update',
  templateUrl: './update.component.html',
  styleUrls: ['./update.component.scss'],
})
export class UpdateComponent  implements OnInit {

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
