import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  QueryList,
  ViewChild,
  ViewChildren,
  NgZone,
  OnDestroy,
  AfterViewChecked,
} from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { DropdownModule } from 'primeng/dropdown';
import { IonicModule } from '@ionic/angular';
import { forkJoin, Subscription } from 'rxjs';
import { SalesService } from '../../core/services/sales.service';
import { AlertsService } from '../../core/services/alerts.service';
import { ThirdPartyService } from '../../core/services/third-party.service';
import { AuthService } from '../../core/services/auth.service';
import { OtpService } from '../../core/services/otp.service';
import {
  CreateBill,
  ProductSelected,
  ProductStock,
} from '../../core/models/sale.model';
import { PaymentMethod } from '../../core/models/global.model';
import { Client } from '../../core/models/client.model';
import {
  ActiveSale,
  SalesStateService,
} from '../../core/services/sales-state.service';

interface AutoCompleteCompleteEvent {
  originalEvent: Event;
  query: string;
}

@Component({
  selector: 'app-sales-form',
  templateUrl: './sales-form.component.html',
  styleUrls: ['./sales-form.component.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    FormsModule,
    AutoCompleteModule,
    IonicModule,
    DropdownModule,
  ],
})
export class SalesFormComponent implements OnInit, OnDestroy, AfterViewChecked {
  @Input() registerBox: any;
  @Output() reloadBoxInfo = new EventEmitter<boolean>();

  @ViewChild('productInput') productInput!: ElementRef;
  @ViewChildren('amountInput') amountInputs!: QueryList<ElementRef>;

  public selectedClient: Client | null = null;
  public selectedProduct: ProductStock | null = null;
  public productSuggestions: { label: string; value: ProductStock }[] = [];
  public clientSuggestions: any[] = [];

  // models
  public clients: Client[] = [];
  public paymentMethods: PaymentMethod[] = [];
  public products: ProductStock[] = [];

  // State from service
  public saleSessions: ActiveSale[] = [];
  public saleSessionSelected!: ActiveSale;

  private subscriptions: Subscription = new Subscription();

  public isLoading: boolean = false;
  public isCapturingWeight: boolean = false;
  public activeInputIndex: number | null = null;

  constructor(
    public authSvc: AuthService,
    private alertSvc: AlertsService,
    private thirdPartySvc: ThirdPartyService,
    private salesSvc: SalesService,
    private salesStateSvc: SalesStateService,
    private ngZone: NgZone,
    private otpService: OtpService
  ) {}

  ngOnInit() {
    // Subscribe to sales sessions from state service
    this.subscriptions.add(
      this.salesStateSvc.salesSessions$.subscribe((sessions) => {
        this.saleSessions = sessions;
      })
    );

    // Subscribe to selected session from state service
    this.subscriptions.add(
      this.salesStateSvc.selectedSession$.subscribe((session) => {
        this.saleSessionSelected = session;
      })
    );
    console.log('Sesión seleccionada actualizada:', this.saleSessionSelected);
    // TODO: Implementar el cliente seleccionado en la sesión
    this.loadInitialData();
    this.writeWeightOnInput();
  }

  ngOnDestroy() {
    // Clean up subscriptions to prevent memory leaks
    this.subscriptions.unsubscribe();
  }

  /**
   * Load initial data (products, payment methods, clients) using forkJoin.
   */
  private loadInitialData(): void {
    forkJoin([
      this.salesSvc.getDisplayStock(300, 0),
      this.salesSvc.getPaymentMethods(),
      this.thirdPartySvc.getClients(300, 0),
    ]).subscribe({
      next: ([stockResp, paymentResp, clientResp]) => {
        this.products = stockResp.results;
        this.paymentMethods = paymentResp.results;
        this.clients = clientResp.results;

        if (
          this.paymentMethods.length > 0 &&
          !this.saleSessionSelected.payment_method
        ) {
          // Update the selected session's payment method
          const updatedSession = {
            ...this.saleSessionSelected,
            payment_method: this.paymentMethods[0],
          };
          this.salesStateSvc.updateSalesSession(updatedSession);
        }
      },
      error: (err) => {
        console.error('Error loading data:', err);
      },
    });
  }

  /**
   * This method checks if the sale is valid.
   */
  isSaleValid(): boolean {
    const hasNullAmount = this.saleSessionSelected.products.some(
      (p) => p.amount === null || p.amount < 0.1
    );
    if (hasNullAmount) {
      return false;
    }
    let isPaymentEnough: boolean;
    if (this.saleSessionSelected.payment_method?.is_payable) {
      isPaymentEnough =
        this.saleSessionSelected.total_received >=
        this.saleSessionSelected.sale && this.saleSessionSelected.sale > 0;
    } else {
      isPaymentEnough = true;
    }

    const hasProducts = this.saleSessionSelected.products.length > 0;

    return isPaymentEnough && hasProducts;
  }

  /**
   * This method creates a new sale.
   */
  createSale() {
    if (!this.isSaleValid()) {
      this.alertSvc
        .presentAlert('Ooops', 'Formulario de venta incompleto')
        .then();
      return;
    }

    const data: CreateBill = {
      date: this.saleSessionSelected.date,
      payment_method: this.saleSessionSelected.payment_method?.id || '',
      total_received: this.saleSessionSelected.total_received,
      sale: this.registerBox,
      products_data: this.saleSessionSelected.products.map(
        (p: ProductSelected) => ({
          product: p.productId,
          amount: Number(p.amount) || 0,
          price: Number(p.price) || 0,
        })
      ),
      ...(this.saleSessionSelected.client && {
        client: this.saleSessionSelected.client.id,
      }),
    };

    this.isLoading = true;
    this.salesSvc.createBill(data).subscribe({
      next: (resp: any) => {
        const updatedSession = {
          ...this.saleSessionSelected,
          isFinalized: true,
          bill: resp,
        };
        this.salesStateSvc.updateSalesSession(updatedSession);

        this.printTicketDirectly(resp);

        this.isLoading = false;
        this.reloadBoxInfo.emit(true);
        this.alertSvc.presentAlert('Éxito', 'Venta completada').then();
        this.selectedClient = null;
      },
      error: (err: any) => {
        this.handleError(err);
        this.isLoading = false;
      },
    });
  }

  /**
   * Create a new sale tab.
   */
  newSale() {
    if (this.saleSessions.length >= 2) {
      this.alertSvc
        .presentAlert(
          'Advertencia',
          'Solo puedes tener dos ventanas de ventas abiertas a la vez'
        )
        .then();
      return;
    }

    const newSale: ActiveSale = {
      date: this.getCurrentDate(),
      client: null,
      payment_method: this.paymentMethods[0],
      total_received: 0,
      products: [],
      sale: 0,
      isFinalized: false,
      bill: {},
    };

    // Add new session to state service
    this.salesStateSvc.addSalesSession(newSale);
  }

  /**
   * Delete a sale tab.
   */
  deleteTab(index: number) {
    // Remove session from state service
    this.salesStateSvc.removeSalesSession(index);
  }

  /**
   * Search for client suggestions for the autoComplete.
   */
  searchClients(event: any) {
    const query = event.query.toLowerCase();
    this.clientSuggestions = this.clients
      .filter(
        (client) =>
          client.first_name.toLowerCase().includes(query) ||
          client.last_name.toLowerCase().includes(query) ||
          (client.company_name &&
            client.company_name.toLowerCase().includes(query)) ||
          client.identification_number.toLowerCase().includes(query) ||
          client.email.toLowerCase().includes(query)
      )
      .map((client) => ({
        label: `${client.company_name} - ${client.first_name} ${client.last_name}`,
        value: client,
      }));
  }

  /**
   * Search for product suggestions for the autoComplete.
   */
  searchProducts(event: AutoCompleteCompleteEvent) {
    const query = event.query.toLowerCase();
    const filtered = this.products.filter(
      (p) =>
        p.product.code.toLowerCase().includes(query) ||
        p.product.name.toLowerCase().includes(query)
    );

    this.productSuggestions = filtered.map((p) => ({
      label: `${p.product.code} - ${p.product.name}`,
      value: p,
      product: p.product,
      price: p.price,
      type_of_unit_measurement: p.type_of_unit_measurement,
    }));
  }

  /**
   * On client select handler
   */
  onClientSelect(event: any) {
    const updatedSession = {
      ...this.saleSessionSelected,
      client: event.value.value,
    };
    this.salesStateSvc.updateSalesSession(updatedSession);
  }

  /**
   * On payment method change handler
   */
  onPaymentMethodChange() {
    const updatedSession = {
      ...this.saleSessionSelected,
      payment_method: this.saleSessionSelected.payment_method,
    };
    this.salesStateSvc.updateSalesSession(updatedSession);
  }

  /**
   * On product select handler - versión simplificada
   */
  onProductSelect(event: any) {
    let productData;

    // Identificar la estructura del evento
    if (event && typeof event === 'object') {
      if (event.value && event.value.product) {
        productData = event.value;
      } else if (event.product) {
        productData = event;
      } else if (event.label && event.value) {
        productData = event;
      } else {
        console.error('Estructura de evento no reconocida:', event);
        return;
      }
    } else {
      console.error('Evento no es un objeto válido:', event);
      return;
    }

    // Si llegamos aquí, tenemos datos suficientes para crear el producto
    try {
      // Crear objeto de producto a agregar
      const productToAdd: ProductSelected = {
        productId: productData.value.id,
        productName: productData.product.name,
        amount: null,
        price: productData.price,
        type_of_unit_measurement: productData.type_of_unit_measurement.name,
      };

      // Agregar producto a la sesión
      const currentProducts = [...this.saleSessionSelected.products];
      currentProducts.push(productToAdd);

      const updatedSession = {
        ...this.saleSessionSelected,
        products: currentProducts,
      };

      // Actualizar la sesión
      this.salesStateSvc.updateSalesSession(updatedSession);

      // IMPORTANTE: Limpiar el producto seleccionado completamente
      this.selectedProduct = null;

      // Comprobar si se actualizó correctamente
      setTimeout(() => {
        // Enfocar el campo de cantidad
        const lastIndex = this.saleSessionSelected.products.length - 1;
        if (this.amountInputs && lastIndex >= 0) {
          const amountInputs = this.amountInputs.toArray();

          if (amountInputs && amountInputs[lastIndex]) {
            amountInputs[lastIndex].nativeElement.focus();
          }
        }
      }, 100);
    } catch (error) {
      console.error('Error procesando producto:', error);
    }
  }

  /**
   * Update the total of the sale (activeSale.sale)
   */
  updateTotalSaleValue() {
    let total = 0;
    this.saleSessionSelected.products.forEach((p) => {
      total += (p.amount || 0) * p.price;
    });

    // Update the selected session
    const updatedSession = {
      ...this.saleSessionSelected,
      sale: total,
    };
    this.salesStateSvc.updateSalesSession(updatedSession);
  }

  /**
   * Remove product from the list
   */
  removeProduct(index: number) {
    // Restaurar la verificación OTP
    this.otpService
      .verifyOtpAndExecute(() => {
        const updatedProducts = [...this.saleSessionSelected.products];
        updatedProducts.splice(index, 1);

        const updatedSession = {
          ...this.saleSessionSelected,
          products: updatedProducts,
        };

        this.salesStateSvc.updateSalesSession(updatedSession);
        this.updateTotalSaleValue();
      }, 'eliminar producto')
      .then();
  }

  /**
   * Only allows numeric input
   */
  onlyNumbers(event: KeyboardEvent) {
    // Allow numbers, backspace, delete, tab, etc.
    return (
      (event.key >= '0' && event.key <= '9') ||
      event.key === '.' ||
      event.key === 'Backspace' ||
      event.key === 'Delete' ||
      event.key === 'ArrowLeft' ||
      event.key === 'ArrowRight' ||
      event.key === 'Tab'
    );
  }

  /**
   * Select tab from the list of open sales
   */
  selectTab(sale: ActiveSale) {
    this.salesStateSvc.setSelectedSession(sale);
  }

  handleError(err: any) {
    if (err.error) {
      const errorKeys = Object.keys(err.error);
      let errorMessage = '';
      errorKeys.forEach((key) => {
        errorMessage += ` ${err.error[key]}\n`;
      });
      this.alertSvc.presentAlert('Ooops', errorMessage).then();
      return;
    }
    this.alertSvc.presentAlert('Ooops', 'An unexpected error occurred.').then();
  }

  async printBill() {
    if (this.saleSessionSelected.bill) {
      this.printTicketDirectly(this.saleSessionSelected.bill, false);
    }
  }

  private printTicketDirectly(bill: any, isRewardTicket = true) {
    if (window.electronAPI) {
      const ticketHtml = this.generateTicketHtml(bill);
      window.electronAPI.send('print-ticket', ticketHtml);

      if (isRewardTicket && !this.authSvc.isOwner()) {
        if (bill.total_cost >= 20000) {
          const numberOfRewardTickets = Math.floor(bill.total_cost / 20000);
          this.printMultipleRewardTickets(numberOfRewardTickets);
        }
      }
    } else {
      this.alertSvc.presentAlert('Error', 'Función de impresión solo disponible en Electron').then();
    }
  }

  private generateTicketHtml(bill: any): string {
    const styles = this.getTicketStyles();
    const ticketContent = this.generateTicketContent(bill);

    return `
      <html lang="es">
        <head>
          <title>Ticket de venta</title>
          <style>${styles}</style>
        </head>
        <body>
          ${ticketContent}
        </body>
      </html>
    `;
  }

  private generateTicketContent(bill: any): string {
    const clientInfo = bill.client ? `
      <div class="client-info mb-2">
        <table class="table table-centered table-borderless w-full mb-0">
          <thead>
            <tr>
              <th></th>
              <th></th>
            </tr>
          </thead>
          <tbody class="w-full">
            <tr class="flex justify-between items-center w-full">
              <td class="text-left font-medium">CLIENTE</td>
              <td class="text-right">
                ${bill.client.first_name} ${bill.client.last_name}
              </td>
            </tr>
            <tr class="flex justify-between items-center w-full">
              <td class="text-left font-medium">NIT/CC</td>
              <td class="text-right">${bill.client.identification_number}</td>
            </tr>
            <tr class="flex justify-between items-center w-full">
              <td class="text-left font-medium">EMAIL</td>
              <td class="text-right">${bill.client.email}</td>
            </tr>
            <tr class="flex justify-between items-center w-full">
              <td class="text-left font-medium">TELÉFONO</td>
              <td class="text-right">${bill.client.phone}</td>
            </tr>
            <tr class="flex justify-between items-center w-full">
              <td class="text-left font-medium">DIRECCIÓN</td>
              <td class="text-right">
                ${bill.client.address || 'No ingresada'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    ` : '';

    const clientBasicInfo = !bill.client ? `
      <tr class="w-full flex justify-between items-center">
        <td class="text-left font-medium">Cliente:</td>
        <td class="text-right">Consumidor final</td>
      </tr>
      <tr class="w-full flex justify-between items-center">
        <td class="text-left font-medium">NIT/CC:</td>
        <td class="text-right">222222222222</td>
      </tr>
    ` : '';

    const productsHtml = bill.display_products.map((p: any) => `
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
    `).join('');

    const unitMeasurementsHtml = Object.keys(bill.total_unit_measurements || {})
      .filter(unit => bill.total_unit_measurements[unit].total > 0)
      .map(unit => `
        <h5 class="pb-1 text-[12px] font-semibold">
          ${bill.total_unit_measurements[unit].total}
          ${bill.total_unit_measurements[unit].name} totales
        </h5>
      `).join('');

    const createdDate = new Date(bill.created).toLocaleString('es-CO');

    return `
      <div id="ticket" style="max-width: 300px">
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
            ${bill.id}
          </h6>
        </div>
        <div class="ticket-body">
          <div class="ticket-info mb-2">
            <h5 class="mx-auto text-center font-bold">Sistema POS</h5>
            <table class="text-center w-full mb-0 mt-2">
              <thead>
                <tr>
                  <th></th>
                  <th></th>
                </tr>
              </thead>
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
                  <td class="text-right">
                    ${bill.user.first_name} ${bill.user.last_name}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          ${clientInfo}

          <div class="ticket-description mb-1">
            <div class="flex justify-between">
              <h6 class="text-xs font-bold">PRODUCTO</h6>
              <h6 class="text-xs font-bold">VALOR</h6>
            </div>
            ${productsHtml}
          </div>
          <div class="ticket-total">
            ${unitMeasurementsHtml}
          </div>
          <div class="ticket-total">
            <div class="flex justify-between">
              <h5 class="pb-1 text-[12px] font-semibold">SUBTOTAL</h5>
              <h5 class="text-xs">$${Number(bill.total_cost).toLocaleString('es-CO', { minimumFractionDigits: 2 })}</h5>
            </div>
          </div>
          <div class="ticket-total">
            <div class="flex justify-between">
              <h5 class="pb-1 text-[12px] font-semibold">RECIBIDO:</h5>
              <h5 class="text-xs">$${Number(bill.total_received).toLocaleString('es-CO', { minimumFractionDigits: 2 })}</h5>
            </div>
          </div>
          <div class="ticket-total">
            <div class="flex justify-between">
              <h5 class="pb-1 text-[12px] font-semibold">CAMBIO:</h5>
              <h5 class="text-xs">$${Number(bill.total_sent).toLocaleString('es-CO', { minimumFractionDigits: 2 })}</h5>
            </div>
          </div>
        </div>
        <div class="ticket-footer text-center w-full">
          <h1 class="text-base font-bold">Gracias por su compra</h1>
          <h6 class="text-xs font-bold">
            ESTE DOCUMENTO NO REEMPLAZA NI SE CONSIDERA LA FACTURA ELECTRONICA, LA
            CUAL SERA ENVIADA POR CORREO ELECTRONICO
          </h6>
          <h6 class="text-xs">Software de facturación electrónica propio</h6>
        </div>
      </div>
    `;
  }

  private getTicketStyles(): string {
    return `h4, h5, h6, p {
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
.text-left {     text-align: left; }
.text-right {     text-align: right; }
.text-sm {     font-size: 0.875rem; line-height: 1.25rem; }
.text-base {     font-size: 1rem; line-height: 1.5rem; }
.font-medium {     font-weight: 500; }
.items-start {     align-items: flex-start; }
`;
  }

  private printMultipleRewardTickets(numberOfTickets: number): void {
    for (let i = 1; i <= numberOfTickets; i++) {
      setTimeout(() => {
        this.printRewardTicketDirectly();
      }, i * 500);
    }
  }

  private printRewardTicketDirectly(): void {
    const rewardTicketHtml = this.generateRewardTicketHtml();
    if (window.electronAPI) {
      window.electronAPI.send('print-ticket', rewardTicketHtml);
    }
  }

  private generateRewardTicketHtml(): string {
    const styles = this.getTicketStyles();

    return `
    <html lang="es">
      <head>
        <title>Ticket de Recompensa</title>
        <style>${styles}</style>
      </head>
      <body>
        <div class="ticket-total">
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
        </div>
      </body>
    </html>
    `;
  }

  printRewardTicket() {
    sessionStorage.setItem(
      'bill',
      JSON.stringify(this.saleSessionSelected.bill)
    );
    window.open('/reward', '_blank');
  }

  /**
   * Clear the current sale form
   */
  clearSale() {
    // Limpiar todas las referencias locales
    this.selectedClient = null;
    this.selectedProduct = null;
    this.productSuggestions = [];
    this.clientSuggestions = [];

    // Obtener el índice de la sesión actual
    const currentIndex = this.saleSessions.findIndex(
      (session) => session === this.saleSessionSelected
    );
    console.log('🔄 Índice de la sesión actual:', currentIndex);

    // Crear una nueva sesión
    const newSale: ActiveSale = {
      date: this.getCurrentDate(),
      client: null,
      payment_method: this.paymentMethods[0],
      total_received: 0,
      products: [],
      sale: 0,
      isFinalized: false,
      bill: null,
    };

    if (currentIndex !== -1) {
      // Eliminar la sesión actual
      this.salesStateSvc.removeSalesSession(currentIndex);

      // Esperar un momento para asegurar que la eliminación se complete
      setTimeout(() => {
        // Agregar la nueva sesión
        this.salesStateSvc.addSalesSession(newSale);
      }, 100);
    }
  }

  /**
   * Get current date as ISO string for date input
   */
  getCurrentDate(): string {
    const date = new Date();
    return date.toISOString().split('T')[0];
  }

  /**
   * Clear on focus for amount fields
   */
  clearOnFocus() {
    if (this.saleSessionSelected.total_received === 0) {
      const updatedSession = {
        ...this.saleSessionSelected,
        total_received: null as any, // Need to allow null temporarily
      };
      this.salesStateSvc.updateSalesSession(updatedSession);
    }
  }

  /**
   * Reset if empty for amount fields
   */
  resetIfEmpty() {
    if (!this.saleSessionSelected.total_received) {
      const updatedSession = {
        ...this.saleSessionSelected,
        total_received: 0,
      };
      this.salesStateSvc.updateSalesSession(updatedSession);
    }
  }

  /**
   * Write weight on input from scale
   */
  writeWeightOnInput() {
    if (window.electronAPI) {
      // —— VERSIÓN ELECTRON ANTIGUA ——
      window.electronAPI.receive('weight', (data: any) => {
        this.ngZone.run(() => {
          if (!this.isCapturingWeight || this.activeInputIndex === null) return;
          const weight = parseFloat(data);
          if (!isNaN(weight)) {
            this.ngZone.run(() => {
              const updatedProducts = [...this.saleSessionSelected.products];
              updatedProducts[this.activeInputIndex!] = {
                ...updatedProducts[this.activeInputIndex!],
                amount: weight,
              };
              this.salesStateSvc.updateSalesSession({
                ...this.saleSessionSelected,
                products: updatedProducts,
              });
              this.updateTotalSaleValue();
            });
          }
        });
      });
    }
    // else {
    //   // —— VERSIÓN POSTMESSAGE (FALLBACK) ——
    //   const handler = (event: MessageEvent) => {
    //     if (!this.isCapturingWeight || this.activeInputIndex === null) return;
    //     // opcionalmente: if (event.origin !== 'tu-origen-esperado') return;
    //     const msg = event.data;
    //     if (typeof msg === 'string' && msg.startsWith('weight:')) {
    //       const weight = parseFloat(msg.substring(7));
    //       if (!isNaN(weight)) {
    //         this.ngZone.run(() => {
    //           const updatedProducts = [...this.saleSessionSelected.products];
    //           updatedProducts[this.activeInputIndex!] = {
    //             ...updatedProducts[this.activeInputIndex!],
    //             amount: weight,
    //           };
    //           this.salesStateSvc.updateSalesSession({
    //             ...this.saleSessionSelected,
    //             products: updatedProducts,
    //           });
    //           this.updateTotalSaleValue();
    //         });
    //       }
    //     }
    //   };
    //   window.addEventListener('message', handler);
    //   // si quieres, almacena `handler` para luego removerlo con removeEventListener
    // }
  }

  /**
   * Toggle weight capture for a specific product
   */
  // toggleWeightCapture(index: number) {
  //   // If we're already capturing for this index, stop
  //   if (this.isCapturingWeight && this.activeInputIndex === index) {
  //     this.isCapturingWeight = false;
  //     this.activeInputIndex = null;
  //     return;
  //   }
  //
  //   // Start capturing for this index
  //   this.isCapturingWeight = true;
  //   this.activeInputIndex = index;
  // }
  toggleWeightCapture(index: number) {
    if (this.isCapturingWeight && this.activeInputIndex === index) {
      this.isCapturingWeight = false;
      this.activeInputIndex = null;
    } else {
      this.isCapturingWeight = true;
      this.activeInputIndex = index;
    }
  }

  /**
   * Get the text to display on the capture button
   */
  toggleCaptureText(index: number): string {
    return this.isCapturingWeight && this.activeInputIndex === index
      ? 'Detener'
      : 'Capturar';
  }

  /**
   * Update product amount and recalculate total
   */
  updateProductAmount(index: number, value: number) {
    // Create a copy of the products array
    const updatedProducts = [...this.saleSessionSelected.products];

    // Update the specific product
    updatedProducts[index] = {
      ...updatedProducts[index],
      amount: value,
    };

    // Update the session
    const updatedSession = {
      ...this.saleSessionSelected,
      products: updatedProducts,
    };

    this.salesStateSvc.updateSalesSession(updatedSession);
    this.updateTotalSaleValue();
  }

  /**
   * Update product price and recalculate total
   */
  updateProductPrice(index: number, value: number) {
    // Create a copy of the products array
    const updatedProducts = [...this.saleSessionSelected.products];

    // Update the specific product
    updatedProducts[index] = {
      ...updatedProducts[index],
      price: value,
    };

    // Update the session
    const updatedSession = {
      ...this.saleSessionSelected,
      products: updatedProducts,
    };

    this.salesStateSvc.updateSalesSession(updatedSession);
    this.updateTotalSaleValue();
  }

  /**
   * Función trackBy para mejorar el rendimiento de la lista de productos
   */
  trackByProductId(index: number, product: ProductSelected): string {
    return product.productId;
  }

  /**
   * Método para detectar y solucionar problemas con el servicio de estado
   * (solo para depuración)
   */
  ngAfterViewChecked() {
    // Verificamos si hay una discrepancia entre el estado local y el del servicio
    if (
      this.saleSessionSelected &&
      this.saleSessionSelected.products &&
      this.salesStateSvc.selectedSession &&
      this.salesStateSvc.selectedSession.products &&
      this.saleSessionSelected.products.length !==
        this.salesStateSvc.selectedSession.products.length
    ) {
      console.log('⚠️ Discrepancia detectada en el número de productos');
      console.log('Local products:', this.saleSessionSelected.products);
      console.log(
        'Service products:',
        this.salesStateSvc.selectedSession.products
      );

      // Forzar sincronización si es necesario
      this.saleSessionSelected = { ...this.salesStateSvc.selectedSession };
    }
  }

  /**
   * Método para limpiar el input de producto después de seleccionar
   */
  clearProductInput() {
    // Limpiar con un pequeño retraso para no interferir con la selección
    setTimeout(() => {
      this.selectedProduct = null;
    }, 200);
  }

  /**
   * Método para restablecer y limpiar el input después de seleccionar un producto
   * @param autoComplete Referencia al componente de autocompletado
   */
  resetAndClearInput(autoComplete: any) {
    // Limpiar el modelo
    this.selectedProduct = null;

    // Intentar limpiar directamente el campo de entrada si está disponible
    try {
      if (
        autoComplete &&
        autoComplete.inputEL &&
        autoComplete.inputEL.nativeElement
      ) {
        // Limpiar el valor del input directamente
        autoComplete.inputEL.nativeElement.value = '';
        // También intentar limpiar cualquier valor interno del componente
        if (autoComplete.value) {
          autoComplete.value = null;
        }
      }
    } catch (error) {
      console.error('Error al limpiar campo de autocompletado:', error);
    }
  }
}
