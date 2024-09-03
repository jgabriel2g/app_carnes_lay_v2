import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {  AutoCompleteModule } from 'primeng/autocomplete';

interface AutoCompleteCompleteEvent {
  originalEvent: Event;
  query: string;
}
@Component({
  selector: 'app-sales-form',
  templateUrl: './sales-form.component.html',
  styleUrls: ['./sales-form.component.scss'],
  standalone:true,
  imports:[
    ReactiveFormsModule,
    CommonModule,
    FormsModule,
    AutoCompleteModule
  ]
})
export class SalesFormComponent  implements OnInit {

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
