import {  Component, ElementRef, EventEmitter, Input, OnInit, Output, QueryList, ViewChild, ViewChildren, NgZone } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {  AutoCompleteModule } from 'primeng/autocomplete';
import { IonicModule } from '@ionic/angular';
import {forkJoin, Observable} from 'rxjs';
import { SalesService } from '../../core/services/sales.service';
import { AlertsService } from '../../core/services/alerts.service';
import { ThirdPartyService } from '../../core/services/third-party.service';
import { AuthService } from '../../core/services/auth.service';
import {OtpService} from "../../core/services/otp.service";

interface AutoCompleteCompleteEvent {
  originalEvent: Event;
  query: string;
}

export interface Sales  {
  date: any,
  client: string,
  payment_method: string,
  total_received: number,
  products: any,
  sale: number,
  isFinalized: boolean,
  bill: any
}

interface Resp {
  count: number,
  next: any,
  previous: any,
  results: any[]
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
  public selectedClient: any;
  public selectedProduct: any;
  public productSuggestions: any[]= [];
  public clientSuggestions: any[]= [];
  public Clients:any[]= [];
  public PaymentMethods:any[]= [];
  public Products:any[]= [];
  @Input() registerBox:any;
  @Output() reloadBoxInfo = new EventEmitter<boolean>();
  @ViewChild('productInput') productInput!: ElementRef;
  @ViewChildren('amountInput') amountInputs!: QueryList<ElementRef>;
  public sales:Sales[] = [
    {
      date: this.getCurrentDate(),
      client: '',
      payment_method: '0b03af7e-60a1-4e1a-a269-0b1ff82b1ab1',
      total_received: 0,
      products:[],
      sale:0  ,
      isFinalized:false,
      bill:null
    },
  ];
  public activeSale:Sales = this.sales[0];
  public isLoading:boolean = false;
  public isCapturingWeight: boolean = false;
  public activeInputIndex: number | null = null;

  constructor(
    public authSvc:AuthService,
    private alertSvc:AlertsService,
    private thirdPartySvc:ThirdPartyService,
    private salesSvc:SalesService,
    private ngZone: NgZone,
    private otpService: OtpService
  ) { }

  ngOnInit() {
    this.getCurrentDate();

    forkJoin([
      this.salesSvc.getDisplayStock(1000, 0) as Observable<Resp>,
      this.salesSvc.getPaymentMethods() as Observable<Resp>,
      this.thirdPartySvc.getClients(10000, 0) as Observable<Resp>
    ]).subscribe({
      next: ([stockResp, paymentResp, clientResp]: [Resp, Resp, Resp]) => {
        this.Products = stockResp.results;
        this.PaymentMethods = paymentResp.results;
        this.Clients = clientResp.results;
      },
      error: (err) => {
        console.error('Error loading data:', err);
      }
    });

    this.writeWeightOnInput();
  }

  isSaleValid(): boolean {
    return (
      this.activeSale.total_received >= this.activeSale.sale &&
      this.activeSale.sale > 0 &&
      this.activeSale.products.length > 0
    );
  }

  createSale() {
    const data = {
      date: this.activeSale.date,
      payment_method: this.activeSale.payment_method,
      total_received: this.activeSale.total_received,
      sale: this.registerBox,
      display_products: this.activeSale.products.map((product: any) => ({
        product: product.product,
        amount: product.amount.toString(),
        price: product.price.toString(),
      })),
    };

    if (this.isSaleValid()) {
      this.isLoading = true;
      this.salesSvc.createBill(data).subscribe({
        error: (err: any) => {
          this.handleError(err);
          this.isLoading = false;
        },
        next: (resp: any) => {
          console.log(resp);
          this.activeSale.isFinalized = true;
          this.reloadBoxInfo.emit(true);
          this.alertSvc.presentAlert('Éxito', 'Venta completada').then();
          this.selectedClient = null;
          this.activeSale.bill = resp;
          this.isLoading = false;
        },
      });
    } else {
      this.alertSvc.presentAlert('Ooops', 'Formulario de venta incompleto').then();
    }
  }

  newSale() {
    if (this.sales.length >= 2) {
      this.alertSvc.presentAlert('Advertencia', 'Solo puedes tener dos ventanas de ventas abiertas a la vez').then();
      return;
    }
    const newSale = {
      date: this.getCurrentDate(),
      client: '',
      payment_method:'0b03af7e-60a1-4e1a-a269-0b1ff82b1ab1',
      total_received: 0,
      products: [],
      sale: 0,
      isFinalized: false,
      bill: {}
    };

    this.sales.push(newSale);
  }

  deleteTab(i:number){
    this.sales.splice(i, 1);
    if (this.sales[0]) {
      this.activeSale = this.sales[this.sales.length - 1]
    } else{
      this.activeSale = {
        date:  this.getCurrentDate(),
        client: '',
        payment_method:'0b03af7e-60a1-4e1a-a269-0b1ff82b1ab1',
        total_received:0,
        products:[],
        sale:0,
        isFinalized:false,
        bill:{}
      }
    }
  };

  searchClients(event: any) {
    let value = event.query
    this.clientSuggestions = this.Clients
      .filter(client => client.first_name.toLowerCase().includes(value.toLowerCase()) ||
              client.last_name.toLowerCase().includes(value.toLowerCase()) ||
              client.identification_number.toLowerCase().includes(value.toLowerCase()) ||
              client.email.toLowerCase().includes(value.toLowerCase())
              )
      .map(client => client.first_name || client.last_name || client.identification_number || client.email);
  };

  searchProducts(event: AutoCompleteCompleteEvent) {
    this.productSuggestions = this.Products
      .filter(products => products.product.name.toLowerCase().includes(event.query.toLowerCase())  || products.product.code.toLowerCase().includes(event.query.toLowerCase())  )
      .map(product => `${ product.product.name}`  );
      // .map(product => `${ product.product.name} - ${product.product.code}` product.product.name );
      // || product.product.code
        // products.product?.code.toLowerCase().includes(event.query.toLowerCase())
  };

  onClientSelect(event: any) {
    let selectedClient = this.Clients.filter( (p:any) =>  p.first_name || p.last_name || p.identification_number || p.email  == event.value)
    this.activeSale.client = selectedClient[0].id;
  };

  onProductSelect(event: any) {
    // || p.code
    let selectedProduct = this.Products.find((p: any) => p.product.name === event.value);
    const productToAdd = {
      product: selectedProduct.id ,
      productName: selectedProduct.product.name,
      amount: null,
      price: selectedProduct.price,
      type_of_unit_measurement: `Ingresa la cantidad en ${selectedProduct.type_of_unit_measurement.name}`,
      isFinalized:false,
    };
    this.activeSale.products.push(productToAdd);
    this.selectedProduct = null

    console.log(this.activeSale.products)
    // Usar setTimeout para asegurarse de que el DOM esté completamente renderizado antes de intentar enfocar
   // Usar setTimeout para asegurar el renderizado y enfocar el último input
   setTimeout(() => {
      const amountInputsArray = this.amountInputs.toArray();
      const lastAmountInput = amountInputsArray[amountInputsArray.length - 1];
      if (lastAmountInput) {
        lastAmountInput.nativeElement.focus();
      } else {
        console.log('No se encontró el input de cantidad para enfocar');
      }
    }, 200);
  };

  updateTotalSaleValue() {
    this.activeSale.sale = this.activeSale.products.reduce((sum: any, product: any) => {
      const amount = Number(product.amount || 0);
      const price = Number(product.price || 0);
      return sum + (amount * price);
    }, 0);
  }

  removeProduct(index: number) {
    this.otpService.verifyOtpAndExecute(() => {
      this.activeSale.products.splice(index, 1);
      this.updateTotalSaleValue();
    }).then();
  }

  onlyNumbers(event: KeyboardEvent) {
    const pressKey = event.key;
    const isNumberOrSymbol = /^[0-9.,]$/.test(pressKey);
    const controlKey = ['Backspace', 'ArrowLeft', 'ArrowRight', 'Delete', 'Tab'];

    if (!isNumberOrSymbol && !controlKey.includes(pressKey)) {
      event.preventDefault();
    }
  };

  selectTab( data:any) {
    this.activeSale = data;
  };

  handleError(err: any) {
    if (err.error) {
      const errorKeys = Object.keys(err.error);

      let errorMessage = '';
      errorKeys.forEach(key => {
        errorMessage += ` ${err.error[key]}\n`;
      });

      this.alertSvc.presentAlert('Ooops', errorMessage).then()
      return;
    }
    this.alertSvc.presentAlert('Ooops', 'An unexpected error occurred.').then()
  };

  printBill(){
    sessionStorage.setItem('bill', JSON.stringify(this.activeSale.bill));
    window.open('/ticket', '_blank');
  };

  printRewardTicket() {
    sessionStorage.setItem('bill', JSON.stringify(this.activeSale.bill));
    window.open('/reward', '_blank');
  };

  clearSale(){
    this.activeSale = {
      date:  this.getCurrentDate(),
      client: '',
      payment_method: '0b03af7e-60a1-4e1a-a269-0b1ff82b1ab1',
      total_received: 0,
      products: [],
      sale: 0,
      isFinalized: false,
      bill: {}
    }
  }

  getCurrentDate() {
    const currentDate = new Date();
    const day = String(currentDate.getDate()).padStart(2, '0');
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const year = currentDate.getFullYear();
    return `${year}-${month}-${day}`;
  }

  clearOnFocus() {
    if (this.activeSale.total_received === 0) {
      this.activeSale.total_received = '' as unknown as number;
    }
  }

  resetIfEmpty() {
    if (this.activeSale.total_received === '' as unknown as number) {
      this.activeSale.total_received = 0;
    }
  }

  writeWeightOnInput() {
    if (window.electronAPI) {
      window.electronAPI.receive('weight', (data: any) => {
        this.ngZone.run(() => {
          if (!this.isCapturingWeight || this.activeInputIndex === null) return;

          const weight = parseFloat(data);
          this.activeSale.products[this.activeInputIndex].amount = weight;

          this.updateTotalSaleValue();
        });
      });
    }
  }

  toggleWeightCapture(index: number) {
    if (this.isCapturingWeight && this.activeInputIndex === index) {
      this.isCapturingWeight = false;
      this.activeInputIndex = null;
    } else {
      this.isCapturingWeight = true;
      this.activeInputIndex = index;
    }
  }

}
