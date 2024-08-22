import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-open-merch-entry-alert',
  templateUrl: './open-merch-entry-alert.component.html',
  styleUrls: ['./open-merch-entry-alert.component.scss'],
  standalone:true,
  imports:[
    CommonModule
  ]
})
export class OpenMerchEntryAlertComponent  implements OnInit {
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
