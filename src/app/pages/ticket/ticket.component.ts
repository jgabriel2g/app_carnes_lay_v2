import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
import { filter } from 'rxjs';

declare const window: any;


@Component({
  selector: 'app-ticket',
  templateUrl: './ticket.component.html',
  styleUrls: ['./ticket.component.scss'],
})
export class TicketComponent  implements OnInit {
  public isPrinting:boolean = false;
  bill: any;

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.bill = JSON.parse(sessionStorage.getItem('bill') ||'')
    setTimeout(() => {
      this.print()
    }, 2000);
  }

  print() {
    if (window.electronAPI) {
      this.isPrinting = true;

      const ticketHtml = document.getElementById('ticket')?.outerHTML;

      if (ticketHtml) {
        window.electronAPI.send('print-ticket', ticketHtml);
      }

      this.isPrinting = false;
    } else {
      window.print();
    }
    this.router.navigateByUrl('/home/sales/new/').then();
  }

  convertToNumber(value:string) {
    return Number(value);
  }

  getTotalUnitMeasurementsKeys(totalUnitMeasurements: any): string[] {
    return Object.keys(totalUnitMeasurements).filter(
      key => totalUnitMeasurements[key].total > 0
    );
  }

}
