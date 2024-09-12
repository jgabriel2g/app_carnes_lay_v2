import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
import { filter } from 'rxjs';

@Component({
  selector: 'app-ticket',
  templateUrl: './ticket.component.html',
  styleUrls: ['./ticket.component.scss'],

})
export class TicketComponent  implements OnInit {
  public isPrinting:boolean = false;
  bill :any;
  public previousUrl!: string;
  public currentUrl!: string;
  constructor(private router: Router) { }
  ngOnInit(): void {
    this.bill = JSON.parse(sessionStorage.getItem('bill') ||'')
    setTimeout(() => {
      this.print()

    }, 2000);

  }

  print(){
    this.isPrinting  = !this.isPrinting;
    window.print();
    this.isPrinting  = !this.isPrinting;
  }

  convertToNumber(value:string) {
    return Number(value); // O puedes usar parseInt(this.inputValue) o parseFloat(this.inputValue)
  }


  return(){
    this.router.navigateByUrl('/home/sales/new')
  }
}
