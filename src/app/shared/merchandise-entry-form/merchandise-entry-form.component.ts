import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {  AutoCompleteModule } from 'primeng/autocomplete';
import { CommonModule } from '@angular/common';
import { MerchandiseEntryProductDetailComponent } from '../merchandise-entry-product-detail/merchandise-entry-product-detail.component';
import { Router } from '@angular/router';


interface AutoCompleteCompleteEvent {
  originalEvent: Event;
  query: string;
}

@Component({
  selector: 'app-merchandise-entry-form',
  templateUrl: './merchandise-entry-form.component.html',
  styleUrls: ['./merchandise-entry-form.component.scss'],
  standalone:true,
  imports: [
    FormsModule,
    AutoCompleteModule,
    FormsModule,
    CommonModule,
    MerchandiseEntryProductDetailComponent
  ]
})
export class MerchandiseEntryFormComponent  implements OnInit {

  constructor(private router:Router) { }

  ngOnInit() {}
  items: any = [
    {
      "name": "Afghanistan",
      "code": "AF"
    }
  ];

  selectedItem: any;

  suggestions: any;

  search(event: AutoCompleteCompleteEvent) {
      this.suggestions = [...Array(10).keys()].map(item => event.query + '-' + item);
  }

  public openDetailMerchEntry:boolean = false;


  onOpenDetailMerchEntry(event:boolean) {
    this.openDetailMerchEntry = false;
  };
}
