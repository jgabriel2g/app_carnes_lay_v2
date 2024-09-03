import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class ListComponent  implements OnInit {
  public loadMoreStock:boolean = false;
  constructor() { }

  ngOnInit() {}

  closeLoadStockDialog(close:boolean){
    this.loadMoreStock = !this.loadMoreStock;
  }
}
