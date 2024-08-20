import { HostListener } from '@angular/core';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
})
export class MainComponent  implements OnInit {
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
