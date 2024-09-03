import { Component, EventEmitter, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-load-new',
  templateUrl: './load-new.component.html',
  styleUrls: ['./load-new.component.scss'],
})
export class LoadNewComponent  implements OnInit {

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
