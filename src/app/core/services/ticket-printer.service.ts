import { Injectable } from '@angular/core';
import { AlertsService } from './alerts.service';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class TicketPrinterService {
  constructor(
    private alertSvc: AlertsService,
    private authSvc: AuthService
  ) {}

  /**
   * Imprime un ticket de venta
   */
  printBillTicket(bill: any, printReward = true): void {
    if (!this.isElectronAvailable()) {
      this.alertSvc.presentAlert('Error', 'Función de impresión solo disponible en Electron');
      return;
    }

    const ticketHtml = this.generateBillTicketHtml(bill);
    window.electronAPI!.send('print-ticket', ticketHtml);

    if (printReward && !this.authSvc.isOwner() && bill.total_cost >= 20000) {
      const numberOfRewardTickets = Math.floor(bill.total_cost / 20000);
      this.printMultipleRewardTickets(numberOfRewardTickets);
    }
  }

  /**
   * Imprime múltiples tickets de recompensa
   */
  private printMultipleRewardTickets(count: number): void {
    for (let i = 1; i <= count; i++) {
      setTimeout(() => this.printRewardTicket(), i * 500);
    }
  }

  /**
   * Imprime un ticket de recompensa
   */
  printRewardTicket(): void {
    if (!this.isElectronAvailable()) return;

    const rewardHtml = this.generateRewardTicketHtml();
    window.electronAPI!.send('print-ticket', rewardHtml);
  }

  /**
   * Verifica si Electron está disponible
   */
  isElectronAvailable(): boolean {
    return !!window.electronAPI;
  }

  /**
   * Genera el HTML del ticket de venta
   */
  private generateBillTicketHtml(bill: any): string {
    return `
      <html lang="es">
        <head>
          <title>Ticket de venta</title>
          <style>${this.getTicketStyles()}</style>
        </head>
        <body>
          ${this.generateBillContent(bill)}
        </body>
      </html>
    `;
  }

  /**
   * Genera el contenido del ticket de venta
   */
  private generateBillContent(bill: any): string {
    const createdDate = new Date(bill.created).toLocaleString('es-CO');

    return `
      <div id="ticket" style="max-width: 300px">
        ${this.generateHeader(bill.id)}
        <div class="ticket-body">
          ${this.generateInfoSection(bill, createdDate)}
          ${bill.client ? this.generateClientSection(bill.client) : ''}
          ${this.generateProductsSection(bill.display_products)}
          ${this.generateTotalsSection(bill)}
        </div>
        ${this.generateFooter()}
      </div>
    `;
  }

  /**
   * Genera el encabezado del ticket
   */
  private generateHeader(billId: string): string {
    return `
      <div class="ticket-header mb-1 text-center w-full">
        <h4 class="text-xs">CARNES LAY</h4>
        <h5 class="text-xs">NIT 19602067-7</h5>
        <h6 class="text-xs">Dir. CL 5 # 9-55 MERCADO PÚBLICO, FUNDACIÓN</h6>
        <h6 class="text-xs font-bold">
          DOCUMENTO ELECTRÓNICO EN PROCESO DE VALIDACION. NO REEMPLAZA LA FACTURA
        </h6>
        <br />
        <h6 class="text-xs font-bold">
          ORDEN DE DESPACHO. <br />
          ${billId}
        </h6>
      </div>
    `;
  }

  /**
   * Genera la sección de información general
   */
  private generateInfoSection(bill: any, createdDate: string): string {
    const clientBasicInfo = !bill.client
      ? `
        <tr class="w-full flex justify-between items-center">
          <td class="text-left font-medium">Cliente:</td>
          <td class="text-right">Consumidor final</td>
        </tr>
        <tr class="w-full flex justify-between items-center">
          <td class="text-left font-medium">NIT/CC:</td>
          <td class="text-right">222222222222</td>
        </tr>
      `
      : '';

    return `
      <div class="ticket-info mb-2">
        <h5 class="mx-auto text-center font-bold">Sistema POS</h5>
        <table class="text-center w-full mb-0 mt-2">
          <thead><tr><th></th><th></th></tr></thead>
          <tbody class="w-full">
            <tr class="w-full flex justify-between items-center">
              <td class="text-left font-medium">Fecha de Generación</td>
              <td class="text-right">${createdDate}</td>
            </tr>
            <tr class="w-full flex justify-between items-center">
              <td class="text-left font-medium">Medio de Pago</td>
              <td class="text-right">${bill.payment_method.name}</td>
            </tr>
            ${clientBasicInfo}
            <tr class="w-full flex justify-between items-center">
              <td class="text-left font-medium">Vendedor:</td>
              <td class="text-right">${bill.user.first_name} ${bill.user.last_name}</td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  }

  /**
   * Genera la sección de cliente
   */
  private generateClientSection(client: any): string {
    return `
      <div class="client-info mb-2">
        <table class="table table-centered table-borderless w-full mb-0">
          <thead><tr><th></th><th></th></tr></thead>
          <tbody class="w-full">
            <tr class="flex justify-between items-center w-full">
              <td class="text-left font-medium">CLIENTE</td>
              <td class="text-right">${client.first_name} ${client.last_name}</td>
            </tr>
            <tr class="flex justify-between items-center w-full">
              <td class="text-left font-medium">NIT/CC</td>
              <td class="text-right">${client.identification_number}</td>
            </tr>
            <tr class="flex justify-between items-center w-full">
              <td class="text-left font-medium">EMAIL</td>
              <td class="text-right">${client.email}</td>
            </tr>
            <tr class="flex justify-between items-center w-full">
              <td class="text-left font-medium">TELÉFONO</td>
              <td class="text-right">${client.phone}</td>
            </tr>
            <tr class="flex justify-between items-center w-full">
              <td class="text-left font-medium">DIRECCIÓN</td>
              <td class="text-right">${client.address || 'No ingresada'}</td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  }

  /**
   * Genera la sección de productos
   */
  private generateProductsSection(products: any[]): string {
    const productsHtml = products
      .map(
        (p) => `
        <div class="flex w-full justify-between items-start">
          <div class="text-xs text-left">
            <p class="text-sm">${p.code} ${p.product}</p>
            <small>${p.amount}${p.type_of_unit_measurement} x $${p.price}</small>
          </div>
          <div class="price text-xs text-end">
            <p class="text-sm">
              $${(Number(p.amount) * Number(p.price)).toLocaleString('es-CO', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      `
      )
      .join('');

    return `
      <div class="ticket-description mb-1">
        <div class="flex justify-between">
          <h6 class="text-xs font-bold">PRODUCTO</h6>
          <h6 class="text-xs font-bold">VALOR</h6>
        </div>
        ${productsHtml}
      </div>
    `;
  }

  /**
   * Genera la sección de totales
   */
  private generateTotalsSection(bill: any): string {
    const unitMeasurementsHtml = Object.keys(bill.total_unit_measurements || {})
      .filter((unit) => bill.total_unit_measurements[unit].total > 0)
      .map(
        (unit) => `
        <h5 class="pb-1 text-[12px] font-semibold">
          ${bill.total_unit_measurements[unit].total}
          ${bill.total_unit_measurements[unit].name} totales
        </h5>
      `
      )
      .join('');

    const formatCurrency = (value: number) =>
      Number(value).toLocaleString('es-CO', { minimumFractionDigits: 2 });

    return `
      <div class="ticket-total">${unitMeasurementsHtml}</div>
      <div class="ticket-total">
        <div class="flex justify-between">
          <h5 class="pb-1 text-[12px] font-semibold">SUBTOTAL</h5>
          <h5 class="text-xs">$${formatCurrency(bill.total_cost)}</h5>
        </div>
      </div>
      <div class="ticket-total">
        <div class="flex justify-between">
          <h5 class="pb-1 text-[12px] font-semibold">RECIBIDO:</h5>
          <h5 class="text-xs">$${formatCurrency(bill.total_received)}</h5>
        </div>
      </div>
      <div class="ticket-total">
        <div class="flex justify-between">
          <h5 class="pb-1 text-[12px] font-semibold">CAMBIO:</h5>
          <h5 class="text-xs">$${formatCurrency(bill.total_sent)}</h5>
        </div>
      </div>
    `;
  }

  /**
   * Genera el pie del ticket
   */
  private generateFooter(): string {
    return `
      <div class="ticket-footer text-center w-full">
        <h1 class="text-base font-bold">Gracias por su compra</h1>
        <h6 class="text-xs font-bold">
          ESTE DOCUMENTO NO REEMPLAZA NI SE CONSIDERA LA FACTURA ELECTRONICA, LA
          CUAL SERA ENVIADA POR CORREO ELECTRONICO
        </h6>
        <h6 class="text-xs">Software de facturación electrónica propio</h6>
      </div>
    `;
  }

  /**
   * Genera el HTML del ticket de recompensa
   */
  private generateRewardTicketHtml(): string {
    return `
      <html lang="es">
        <head>
          <title>Ticket de Recompensa</title>
          <style>${this.getTicketStyles()}</style>
        </head>
        <body>
          <div class="ticket-total">
            <div class="ticket-info mb-2">
              <p class="text-center font-bold">¡PARTICIPA EN LA RIFA!</p>
              <br>
              <p class="text-center font-bold mb-2">Completa con tus datos y participa en el sorteo de una moto boxer</p>
              <br>
              <div class="text-left">
                <p class="mb-1"><small>Nombre:_____________________________________</small></p>
                <br>
                <p class="mb-1"><small>Cédula:______________________________________</small></p>
                <br>
                <p class="mb-1"><small>Teléfono:____________________________________</small></p>
                <br>
              </div>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Estilos CSS para los tickets
   */
  private getTicketStyles(): string {
    return `
      h4, h5, h6, p { margin-bottom: 0 !important; margin-top: 3px !important; }
      .ticket-header, .ticket-info, .client-info, .ticket-description, .ticket-total {
        padding-top: 8px; padding-bottom: 8px; border-bottom: dashed .5px black;
      }
      .table>:not(caption)>*>* { padding: 0 !important; }
      table { font-size: 12px; }
      .ticket-auth { font-size: 11px; }
      .mb-1 { margin-bottom: 0.25rem; }
      .mb-2 { margin-bottom: 0.5rem; }
      .logo { height: 100px; }
      .text-xs { font-size: 0.75rem; line-height: 1rem; }
      .font-bold { font-weight: 700; }
      .text-center { text-align: center; }
      .mb-0 { margin-bottom: 0px; }
      .mt-2 { margin-top: 0.5rem; }
      .flex { display: flex; }
      .justify-between { justify-content: space-between; }
      .items-center { align-items: center; }
      .w-full { width: 100%; }
      .text-left { text-align: left; }
      .text-right { text-align: right; }
      .text-sm { font-size: 0.875rem; line-height: 1.25rem; }
      .text-base { font-size: 1rem; line-height: 1.5rem; }
      .font-medium { font-weight: 500; }
      .items-start { align-items: flex-start; }
    `;
  }
}
