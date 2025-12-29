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
import { TicketPrinterService } from '../../core/services/ticket-printer.service';
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
import { BarcodeDecoderService } from '../../core/services/barcode-decoder.service';

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
export class SalesFormComponent implements OnInit, OnDestroy {
  @Input() registerBox: any;
  @Output() reloadBoxInfo = new EventEmitter<boolean>();

  @ViewChildren('amountInput') amountInputs!: QueryList<ElementRef>;
  @ViewChild('scannerTrap') scannerTrap!: ElementRef;

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

  // Scanner properties
  public scannerTrapValue: string = '';
  public scannerIsActive: boolean = false;

  constructor(
    public authSvc: AuthService,
    private alertSvc: AlertsService,
    private thirdPartySvc: ThirdPartyService,
    private salesSvc: SalesService,
    private salesStateSvc: SalesStateService,
    private ngZone: NgZone,
    private otpService: OtpService,
    private ticketPrinterSvc: TicketPrinterService,
    private barcodeDecoder: BarcodeDecoderService
  ) {}

  ngOnInit() {
    this.subscriptions.add(
      this.salesStateSvc.salesSessions$.subscribe((sessions) => {
        this.saleSessions = sessions;
      })
    );
    this.subscriptions.add(
      this.salesStateSvc.selectedSession$.subscribe((session) => {
        this.saleSessionSelected = session;
        if (session.client) {
          this.selectedClient = {
            label: `${session.client.company_name} - ${session.client.first_name} ${session.client.last_name}`,
            value: session.client,
          } as any;
        } else {
          this.selectedClient = null;
        }
      })
    );
    this.loadInitialData();
    this.writeWeightOnInput();
    this.initScanner();
  }

  ngOnDestroy() {
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

        this.ticketPrinterSvc.printBillTicket(resp, false);

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
    if (this.authSvc.hasAdminPermission()) {
      const updatedProducts = [...this.saleSessionSelected.products];
      updatedProducts.splice(index, 1);

      const updatedSession = {
        ...this.saleSessionSelected,
        products: updatedProducts,
      };

      this.salesStateSvc.updateSalesSession(updatedSession);
      this.updateTotalSaleValue();
      return
    }
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

  printBill(): void {
    if (this.saleSessionSelected.bill) {
      this.ticketPrinterSvc.printBillTicket(this.saleSessionSelected.bill, false);
    }
  }

  printRewardTicket(): void {
    this.ticketPrinterSvc.printRewardTicket();
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
        // Reenfocar el scanner
        this.focusScannerTrap();
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
  }

  /**
   * Toggle weight capture for a specific product
   */
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

  // ==================== SCANNER METHODS ====================

  /**
   * Inicializa el scanner de códigos de barras
   */
  private initScanner(): void {
    setTimeout(() => this.focusScannerTrap(), 500);
    this.setupGlobalClickListener();
  }

  /**
   * Maneja el evento keydown del scanner trap
   */
  onScannerTrapKeyDown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      const barcode = this.scannerTrapValue.trim();
      if (barcode.length > 0) {
        this.processBarcode(barcode);
        this.scannerTrapValue = '';
      }
    }
  }

  onScannerTrapFocus(): void {
    this.scannerIsActive = true;
  }

  onScannerTrapBlur(): void {
    this.scannerIsActive = false;
  }

  onInputFocus(): void {
    // Placeholder para futura lógica
  }

  onInputBlur(): void {
    setTimeout(() => {
      const activeElement = document.activeElement as HTMLElement;
      const tagName = activeElement?.tagName?.toUpperCase() || '';
      if (
        !this.saleSessionSelected?.isFinalized &&
        tagName !== 'INPUT' &&
        tagName !== 'TEXTAREA' &&
        tagName !== 'SELECT' &&
        !activeElement?.classList?.contains('p-inputtext') &&
        activeElement?.closest('.p-autocomplete') === null &&
        activeElement?.closest('.p-dropdown') === null
      ) {
        this.focusScannerTrap();
      }
    }, 100);
  }

  /**
   * Enfoca el input oculto del scanner
   */
  focusScannerTrap(): void {
    if (this.scannerTrap?.nativeElement) {
      this.scannerTrap.nativeElement.focus();
    }
  }

  /**
   * Configura el listener global de clicks para reenfocar el scanner
   */
  private setupGlobalClickListener(): void {
    document.addEventListener('click', (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const isInteractiveElement =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'BUTTON' ||
        target.tagName === 'SELECT' ||
        target.closest('.p-autocomplete') !== null ||
        target.closest('.p-dropdown') !== null ||
        target.closest('.p-inputtext') !== null ||
        target.closest('.p-button') !== null;

      if (!isInteractiveElement) {
        setTimeout(() => this.focusScannerTrap(), 10);
      }
    });
  }

  /**
   * Procesa un código de barras escaneado
   */
  private processBarcode(barcode: string): void {
    this.ngZone.run(() => {
      const productsWithBarcode = this.products.filter((p) => p.barcode);
      const decoded = this.barcodeDecoder.decode(barcode, productsWithBarcode);

      if (!decoded.isValid) {
        this.alertSvc.presentAlert('Error', 'Código de barras inválido');
        return;
      }

      // Buscar producto por código (sin ceros a la izquierda)
      const productCodeWithoutZeros = parseInt(decoded.productCode, 10).toString();
      const product = this.products.find(
        (p) => p.product.code === productCodeWithoutZeros
      );

      if (!product) {
        this.alertSvc.presentAlert(
          'Error',
          `Producto con código ${productCodeWithoutZeros} no encontrado`
        );
        return;
      }

      // Agregar producto a la sesión
      const productToAdd: ProductSelected = {
        productId: product.id,
        productName: product.product.name,
        amount: decoded.weight,
        price: product.price,
        type_of_unit_measurement: product.type_of_unit_measurement.name,
      };

      const currentProducts = [...this.saleSessionSelected.products];
      currentProducts.push(productToAdd);

      const updatedSession = {
        ...this.saleSessionSelected,
        products: currentProducts,
      };

      this.salesStateSvc.updateSalesSession(updatedSession);
      this.updateTotalSaleValue();
    });
  }
}
