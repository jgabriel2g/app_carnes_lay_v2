import { Component, OnInit } from '@angular/core';
import {Router} from "@angular/router";

@Component({
  selector: 'app-daily-ticket',
  templateUrl: './daily-ticket.component.html',
  styleUrls: ['./daily-ticket.component.scss'],
})
export class DailyTicketComponent implements OnInit {
  public isPrinting:boolean = false;
  sale: any

  constructor(private router: Router) { }

  ngOnInit(): void {
    this.sale = JSON.parse(sessionStorage.getItem('saleSummary') ||'')
    setTimeout(() => {
      this.print()
    }, 2000);
  }

  print() {
    this.isPrinting  = !this.isPrinting;
    window.print();
    // window.electronAPI.triggerPrint();
    this.isPrinting  = !this.isPrinting;
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
