import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-delete-alert',
  templateUrl: './delete-alert.component.html',
  styleUrls: ['./delete-alert.component.scss'],
  standalone:true,
  imports:[]
})
export class DeleteAlertComponent  implements OnInit {
  @Input() category:string ='';
  @Output() isDelete = new EventEmitter<boolean>();
  constructor() { }

  ngOnInit() {}

  actionResponse(value:boolean) {
    this.isDelete.emit(value);
  }
}
