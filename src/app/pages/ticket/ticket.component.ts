import {AfterViewInit, Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {Bill} from "../../core/models/sale.model";

declare const window: any;


@Component({
  selector: 'app-ticket',
  templateUrl: './ticket.component.html',
  styleUrls: ['./ticket.component.scss'],
})
export class TicketComponent  implements OnInit, AfterViewInit {
  public isPrinting:boolean = false;
  public bill: Bill | undefined;

  constructor(private router: Router) { }

  ngOnInit(): void {
    const navigation = this.router.getCurrentNavigation();
    if (navigation?.extras?.state) {
      this.bill = navigation.extras.state['bill'];
    }
  }

  ngAfterViewInit(): void {
    if (this.bill) {
      setTimeout(() => this.print(), 1000);
    }
  }

  print() {
    if (window.electronAPI) {
      this.isPrinting = true;

      const ticketElement = document.getElementById('ticket');

      if (ticketElement) {
        const styles = `h4, h5, h6, p {
  margin-bottom: 0 !important;
  margin-top: 3px !important;
}

.ticket-header , .ticket-info, .client-info, .ticket-description , .ticket-total{
  padding-top: 8px;
  padding-bottom: 8px;
  border-bottom: dashed .5px black;
}
.table>:not(caption)>*>*{
    padding: 0 !important;
}

table {
  font-size: 12px;
}

.ticket-auth {
  font-size: 11px;
}

.mb-1 {
  margin-bottom: 0.25rem;
}

.mb-2 {
  margin-bottom: 0.5rem;
}

.logo {
  height: 100px;
}

.text-xs {
  font-size: 0.75rem;
  line-height: 1rem;
}

.font-bold {
  font-weight: 700;
}

.text-center {
  text-align: center;
}

.mb-0 {     margin-bottom: 0px; }
.mt-2 {     margin-top: 0.5rem/* 8px */; }

.flex {
  display: flex;
}

.justify-between {
  justify-content: space-between;
}

.items-center {     align-items: center; }
.w-full {     width: 100%; }
`
        const ticketHtml = `
        <html lang="es">
          <head>
            <title>Daily Ticket</title>
            <style>${styles}</style>
          </head>
          <body>
            ${ticketElement.outerHTML}
          </body>
        </html>
      `;
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
