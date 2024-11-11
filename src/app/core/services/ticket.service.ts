import { ipcRenderer } from 'electron';

export class TicketService {
  printTicket(ticketHtml: string) {
    ipcRenderer.send('print-ticket', ticketHtml);
  }
}
