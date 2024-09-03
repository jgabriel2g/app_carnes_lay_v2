import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-users-form',
  templateUrl: './users-form.component.html',
  styleUrls: ['./users-form.component.scss'],
  standalone:true,
  imports:[
    FormsModule,
    CommonModule,
    RouterModule
  ]
})
export class UsersFormComponent  implements OnInit {

  constructor() { }

  ngOnInit() {}

}
