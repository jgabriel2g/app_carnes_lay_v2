import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-stock',
  templateUrl: './stock.component.html',
  styleUrls: ['./stock.component.scss'],
})
export class StockComponent  implements OnInit {

  public showDeleteAlert:boolean = false;
  constructor() { }

  ngOnInit() {}


  onDelete(){
    this.showDeleteAlert = !this.showDeleteAlert;
  }

  delete(event:boolean){
    this.showDeleteAlert = !this.showDeleteAlert;

  }

}
