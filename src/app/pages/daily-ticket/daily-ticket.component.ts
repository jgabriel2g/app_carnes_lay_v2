import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { Sale } from "../../core/models/sale.model";

declare const window: any;

@Component({
  selector: 'app-daily-ticket',
  templateUrl: './daily-ticket.component.html',
  styleUrls: ['./daily-ticket.component.scss'],
})
export class DailyTicketComponent implements OnInit {
  public isPrinting: boolean = false;
  sale: Sale | null = null;

  constructor(private router: Router) {}

  ngOnInit(): void {
    const navigation = history.state as { sale: Sale | null };
    this.sale = navigation.sale;

    if (!this.sale?.isMobile) {
      setTimeout(() => {
        this.print();
      }, 2000);
    }
  }

  print() {
    if (window.electronAPI && this.sale) {
      this.isPrinting = true;

      const ticketElement = document.getElementById('ticket');
      if (ticketElement) {
        const styles = `h4, h5, h6, p {
  margin-bottom: 0 !important;
  margin-top: 3px !important;
}

.mb-1 {
  margin-bottom: 0.25rem/* 4px */;
}

.mb-2 {
  margin-bottom: 0.5rem/* 8px */;
}

.text-center {
  text-align: center;
}

.w-full {
  width: 100%;
}

.mx-auto {
  margin-left: auto;
  margin-right: auto;
}

.text-xs {
  font-size: 0.75rem;
  line-height: 1rem;
}

.text-left {
  text-align: left;
}

.flex {
  display: flex;
}

.justify-between {
  justify-content: space-between;
}

.text-right {
  text-align: right;
}

.text-sm {
  font-size: 0.875rem/* 14px */;
  line-height: 1.25rem/* 20px */;
}

.font-bold {
  font-weight: 700;
}

.text-base {
  font-size: 1rem;
  line-height: 1.5rem;
}

.logo {
  height: 100px;
}

.ticket-header,
.ticket-info,
.ticket-description,
.ticket-subtotal,
.ticket-total {
  padding-top: 8px;
  padding-bottom: 8px;
  border-bottom: dashed 0.5px black;
}

.table > :not(caption) > * > * {
  padding: 0 !important;
}

table {
  font-size: 12px;
}

.ticket-auth {
  font-size: 11px;
}

.ticket-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}
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
}
