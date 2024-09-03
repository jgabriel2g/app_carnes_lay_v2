import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-merchandise-entry-product-detail',
  templateUrl: './merchandise-entry-product-detail.component.html',
  styleUrls: ['./merchandise-entry-product-detail.component.scss'],
  standalone:true,
  imports:[
    CommonModule
  ]
})
export class MerchandiseEntryProductDetailComponent  implements OnInit {


  @Output() close = new EventEmitter<boolean>();

  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.

  }
  constructor() { }
  public showInventoryMenu:boolean = false;


  actionResponse(value:boolean) {
    this.close.emit(value);
  }
}
