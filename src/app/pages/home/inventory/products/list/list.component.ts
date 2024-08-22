import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2'
@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class ListComponent  implements OnInit {
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
