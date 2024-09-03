import { Component, HostListener, OnInit } from '@angular/core';


@Component({
  selector: 'app-create',
  templateUrl: './create.component.html',
  styleUrls: ['./create.component.scss'],
})
export class CreateComponent  implements OnInit {

  constructor() {
    this.checkScreenWidth(); // Verifica el ancho inicial

   }

  ngOnInit() {
    this.checkScreenWidth();

  }


  public windowWith:any;

  public isColapsed:boolean = false

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenWidth();
  }

  checkScreenWidth() {

    this.windowWith = window.innerWidth
  }

}
