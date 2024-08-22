import { Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-inventory-form',
  templateUrl: './inventory-form.component.html',
  styleUrls: ['./inventory-form.component.scss'],
  standalone:true,
  imports:[
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    CommonModule
  ]
})
export class InventoryFormComponent  implements OnInit {

  constructor() { }

  ngOnInit() {}

}
