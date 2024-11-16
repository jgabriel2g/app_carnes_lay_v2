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

      const ticketElement = document.getElementById('ticket');
      if (ticketElement) {
        const styles = `
        h4, h5, h6, p {
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

.text-center {
  text-align: center;
}

.w-full {
  width: 100%;
}

.logo {
  height: 100px;
}

.text-xs {
  font-size: 0.75rem;
  line-height: 1rem;
}

.mb-2 {
  margin-bottom: 0.5rem;
}

.text-left {
  text-align: left;
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
    // this.router.navigateByUrl('/home/sales/new/').then();
  }
}
