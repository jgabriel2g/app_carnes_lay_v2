import {  Component, ElementRef, EventEmitter, Input, OnInit, Output, QueryList, ViewChild, ViewChildren, NgZone } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {  AutoCompleteModule } from 'primeng/autocomplete';
import { IonicModule } from '@ionic/angular';
import { forkJoin } from 'rxjs';
import { SalesService } from '../../core/services/sales.service';
import { AlertsService } from '../../core/services/alerts.service';
import { ThirdPartyService } from '../../core/services/third-party.service';
import { AuthService } from '../../core/services/auth.service';
import {OtpService} from "../../core/services/otp.service";
import {CreateBill, ProductSelected, ProductStock} from "../../core/models/sale.model";
import {PaymentMethod} from "../../core/models/global.model";
import {Client} from "../../core/models/client.model";
import {Router} from "@angular/router";

interface AutoCompleteCompleteEvent {
  originalEvent: Event;
  query: string;
}

interface ActiveSale  {
  date: string,
  client: string | null,
  payment_method: string,
  total_received: number,
  products: ProductSelected[],
  sale: number,
  bill: any,
  isFinalized: boolean,
}

@Component({
  selector: 'app-sales-form',
  templateUrl: './sales-form.component.html',
  styleUrls: ['./sales-form.component.scss'],
  standalone:true,
  imports:[
    ReactiveFormsModule,
    CommonModule,
    FormsModule,
    AutoCompleteModule,
    IonicModule,
  ]
})
export class SalesFormComponent  implements OnInit {
  @Input() registerBox:any;
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

  public saleSessions: ActiveSale[] = [
    {
      date: this.getCurrentDate(),
      client: '',
      payment_method: '',
      total_received: 0,
      products:[],
      sale:0  ,
      isFinalized:false,
      bill:null
    },
  ];

  public saleSessionSelected: ActiveSale = this.saleSessions[0];
  public isLoading:boolean = false;
  public isCapturingWeight: boolean = false;
  public activeInputIndex: number | null = null;

  constructor(
    public authSvc:AuthService,
    private alertSvc:AlertsService,
    private thirdPartySvc:ThirdPartyService,
    private salesSvc:SalesService,
    private ngZone: NgZone,
    private otpService: OtpService,
    private router:Router
  ) { }

  ngOnInit() {
    this.loadInitialData();
    this.writeWeightOnInput();
  }

  /**
   * Load initial data (products, payment methods, clients) using forkJoin.
   */
  private loadInitialData(): void {
    forkJoin([
      this.salesSvc.getDisplayStock(1000, 0),
      this.salesSvc.getPaymentMethods(),
      this.thirdPartySvc.getClients(100, 0),
    ]).subscribe({
      next: ([stockResp, paymentResp, clientResp]) => {
        this.products = stockResp.results;
        this.paymentMethods = paymentResp.results;
        this.clients = clientResp.results;

        if (
          this.paymentMethods.length > 0 &&
          !this.saleSessionSelected.payment_method
        ) {
          this.saleSessionSelected.payment_method = this.paymentMethods[0].id;
        }
      },
      error: (err) => {
        console.error('Error loading data:', err);
      }
    });
  }

  /**
   * This method checks if the sale is valid.
   */
  isSaleValid(): boolean {
    const hasNullAmount = this.saleSessionSelected.products.some(
      (p) => p.amount === null
    );
    if (hasNullAmount) {
      return false;
    }
    const isPaymentEnough =
      this.saleSessionSelected.total_received >= this.saleSessionSelected.sale &&
      this.saleSessionSelected.sale > 0;
    const hasProducts = this.saleSessionSelected.products.length > 0;

    return isPaymentEnough && hasProducts;
  }

  /**
   * This method creates a new sale.
   */
  createSale() {
    if (!this.isSaleValid()) {
      this.alertSvc.presentAlert('Ooops', 'Formulario de venta incompleto').then();
      return;
    }

    const data: CreateBill = {
      date: this.saleSessionSelected.date,
      payment_method: this.saleSessionSelected.payment_method,
      total_received: this.saleSessionSelected.total_received,
      sale: this.registerBox,
      products_data: this.saleSessionSelected.products.map((p: ProductSelected) => ({
        product: p.productId,
        amount: Number(p.amount) || 0,
        price: Number(p.price) || 0
      })),
      ...(this.saleSessionSelected.client && { client: this.saleSessionSelected.client }),
    };

    this.isLoading = true;
    this.salesSvc.createBill(data).subscribe({
      next: (resp: any) => {
        console.log(resp);
        this.saleSessionSelected.isFinalized = true;
        this.saleSessionSelected.bill = resp;
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
      this.alertSvc.presentAlert(
        'Advertencia',
        'Solo puedes tener dos ventanas de ventas abiertas a la vez'
      ).then();
      return;
    }

    const newSale: ActiveSale = {
      date: this.getCurrentDate(),
      client: '',
      payment_method: this.paymentMethods[0].id,
      total_received: 0,
      products: [],
      sale: 0,
      isFinalized: false,
      bill: {}
    };

    this.saleSessions.push(newSale);
    this.saleSessionSelected = newSale;
  }

  /**
   * Delete a sale tab.
   */
  deleteTab(index: number) {
    this.saleSessions.splice(index, 1);
    this.saleSessionSelected = this.saleSessions[this.saleSessions.length - 1] || {
      date: this.getCurrentDate(),
      client: '',
      payment_method: '0b03af7e-60a1-4e1a-a269-0b1ff82b1ab1',
      total_received: 0,
      products: [],
      sale: 0,
      isFinalized: false,
      bill: {}
    };
  }

  /**
   * Search for client suggestions for the autoComplete.
   */
  searchClients(event: any) {
    const query = event.query.toLowerCase();
    this.clientSuggestions = this.clients
      .filter(client =>
        client.first_name.toLowerCase().includes(query) ||
        client.last_name.toLowerCase().includes(query) ||
        (client.company_name && client.company_name.toLowerCase().includes(query)) ||
        client.identification_number.toLowerCase().includes(query) ||
        client.email.toLowerCase().includes(query)
      )
      .map(client => ({
        label: `${client.first_name} ${client.last_name}`, // 🔹 Mostrará este texto en el input
        value: client
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
      label: `${p.product.code} ${p.product.name}`,
      value: p,
    }));
  }

  /**
   * Select the client after clicking on a suggestion.
   */
  onClientSelect(event: any) {
    this.selectedClient = event.value;
    this.saleSessionSelected.client = event.value.value.id;
  }

  /**
   * Manage the selection of product (autocompleted).
   */
  onProductSelect(event: any) {
    const selectedProduct: ProductStock = event.value.value;
    if (!selectedProduct) return;

    const productToAdd: ProductSelected = {
      productId: selectedProduct.id,
      productName: selectedProduct.product.name,
      amount: null,
      price: selectedProduct.price,
      type_of_unit_measurement: selectedProduct.type_of_unit_measurement.id
    };

    this.saleSessionSelected.products.push(productToAdd);
    this.selectedProduct = null;

    setTimeout(() => {
      const amountInputsArray = this.amountInputs.toArray();
      const lastAmountInput = amountInputsArray[amountInputsArray.length - 1];
      if (lastAmountInput) {
        lastAmountInput.nativeElement.focus();
      }
    }, 200);

  }

  /**
   * Update the total of the sale (activeSale.sale)
   */
  updateTotalSaleValue() {
    this.saleSessionSelected.sale = this.saleSessionSelected.products.reduce((sum: any, p: ProductSelected) => {
      const amount = Number(p.amount || 0);
      const price = Number(p.price || 0);
      return sum + amount * price;
    }, 0);
  }

  /**
   * Delete a product from the sale after confirming OTP.
   */
  removeProduct(index: number) {
    this.otpService.verifyOtpAndExecute(() => {
      this.saleSessionSelected.products.splice(index, 1);
      this.updateTotalSaleValue();
    }).then();
  }

  /**
   * Permite solo números y símbolo decimal.
   */
  onlyNumbers(event: KeyboardEvent) {
    const pressKey = event.key;
    const isNumberOrSymbol = /^[0-9.,]$/.test(pressKey);
    const controlKey = ['Backspace', 'ArrowLeft', 'ArrowRight', 'Delete', 'Tab'];

    if (!isNumberOrSymbol && !controlKey.includes(pressKey)) {
      event.preventDefault();
    }
  }

  selectTab(data: ActiveSale) {
    this.saleSessionSelected = data;
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

  printBill() {
    this.router.navigate(['/ticket'], { state: { bill: this.saleSessionSelected.bill } });
  }

  printRewardTicket() {
    sessionStorage.setItem('bill', JSON.stringify(this.saleSessionSelected.bill));
    window.open('/reward', '_blank');
  }

  clearSale() {
    this.saleSessionSelected = {
      date: this.getCurrentDate(),
      client: '',
      payment_method: '0b03af7e-60a1-4e1a-a269-0b1ff82b1ab1',
      total_received: 0,
      products: [],
      sale: 0,
      isFinalized: false,
      bill: {}
    };
  }

  getCurrentDate(): string {
    const currentDate = new Date();
    const day = String(currentDate.getDate()).padStart(2, '0');
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const year = currentDate.getFullYear();
    return `${year}-${month}-${day}`;
  }

  clearOnFocus() {
    if (this.saleSessionSelected.total_received === 0) {
      this.saleSessionSelected.total_received = '' as unknown as number;
    }
  }

  resetIfEmpty() {
    if (this.saleSessionSelected.total_received === ('' as unknown as number)) {
      this.saleSessionSelected.total_received = 0;
    }
  }

  /**
   * Subscribe to the "weight" event via Electron (if it exists) and update the amount of the active product
   */
  writeWeightOnInput() {
    if (window.electronAPI) {
      window.electronAPI.receive('weight', (data: any) => {
        this.ngZone.run(() => {
          if (!this.isCapturingWeight || this.activeInputIndex === null) return;

          const weight = parseFloat(data);
          this.saleSessionSelected.products[this.activeInputIndex].amount = weight;
          this.updateTotalSaleValue();
        });
      });
    }
  }

  /**
   * Activate/deactivate weight capture for a product in the list.
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
   * Toggle text of weight capture button.
   */
  toggleCaptureText(index: number): string {
    return this.isCapturingWeight && this.activeInputIndex === index
      ? 'Dejar de Capturar'
      : 'Capturar Peso';
  }
}
