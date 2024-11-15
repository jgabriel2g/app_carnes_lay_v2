import { Component, OnInit } from '@angular/core';
import { Router } from "@angular/router";
import { SaleResponse } from "../../core/interfaces/sale";

declare const window: any;

@Component({
  selector: 'app-daily-ticket',
  templateUrl: './daily-ticket.component.html',
  styleUrls: ['./daily-ticket.component.scss'],
})
export class DailyTicketComponent implements OnInit {
  public isPrinting: boolean = false;
  sale: SaleResponse | null = null;

  constructor(private router: Router) {}

  ngOnInit(): void {
    const navigation = history.state as { sale: SaleResponse | null };
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
}
