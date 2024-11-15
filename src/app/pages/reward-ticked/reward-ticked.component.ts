import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reward-ticked',
  templateUrl: './reward-ticked.component.html',

  styleUrls: ['./reward-ticked.component.scss'],
})
export class RewardTickedComponent  implements OnInit {

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
