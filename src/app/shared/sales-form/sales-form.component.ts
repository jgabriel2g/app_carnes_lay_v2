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
import { Router } from '@angular/router';
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
    private otpService: OtpService,
    private router: Router
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
      this.thirdPartySvc.getClients(30, 0),
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
    const isPaymentEnough =
      this.saleSessionSelected.total_received >=
        this.saleSessionSelected.sale && this.saleSessionSelected.sale > 0;
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
        console.log(resp);

        // Update session in state service
        const updatedSession = {
          ...this.saleSessionSelected,
          isFinalized: true,
          bill: resp,
        };
        this.salesStateSvc.updateSalesSession(updatedSession);

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
        label: `${client.first_name} ${client.last_name}`, // 🔹 Mostrará este texto en el input
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
    await this.router.navigate(['/ticket'], {
      state: { bill: this.saleSessionSelected.bill },
    });
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
