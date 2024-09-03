import { Component, HostListener, OnInit } from '@angular/core';


export interface Sales  {
  initDate:string,
  finalDate:string,
  user:string,
  paymentMethod:number,
  products:any,
}


@Component({
  selector: 'app-sales-main',
  templateUrl: './sales-main.component.html',
  styleUrls: ['./sales-main.component.scss'],
})
export class SalesMainComponent  implements OnInit {
  public sales:Sales[] = [
    {
      initDate:'',
      finalDate:'',
      user:'Pepito',
      paymentMethod:1,
      products:[],
     },
  ];

  activeSale:any = this.sales[0];


  selectTab( data:any) {
    this.activeSale = data;
  }
  constructor() {
    this.checkScreenWidth(); // Verifica el ancho inicial
  }

  ngOnInit() {
    this.checkScreenWidth();

  }

  newSale(){
    const newSale = {
      initDate:'',
      finalDate:'',
      user:'Pepito',
      paymentMethod:1,
      products:[],
    }

    this.sales.push(newSale);
    console.log(this.sales)
  }

  deleteTab(i:number){
    this.sales.splice(i, 1);
    if (this.sales[0]) {
      this.activeSale = this.sales[this.sales.length - 1]
    } else{
      this.activeSale = null
    }
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
