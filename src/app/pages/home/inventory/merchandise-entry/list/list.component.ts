import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class ListComponent  implements OnInit {
  public openNewMerchEntryModal:boolean = false;
  constructor(private router:Router) { }

  ngOnInit() {}


  openNewMerchEntry(event:boolean) {
    this.openNewMerchEntryModal = false;
    if (event) {
        this.router.navigateByUrl('/home/inventory/merchandiseEntry/create')
    };
  };
}
