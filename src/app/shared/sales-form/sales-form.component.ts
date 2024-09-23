import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Router } from '@angular/router';
import {  AutoCompleteModule } from 'primeng/autocomplete';
import { AlertController, IonicModule } from '@ionic/angular';
import { SalesService } from '../../core/services/sales.service';
import { AlertsService } from '../../core/services/alerts.service';
import { ThirdPartyService } from '../../core/services/third-party.service';
import { AuthService } from '../../core/services/auth.service';

interface AutoCompleteCompleteEvent {
  originalEvent: Event;
  query: string;
}

export interface Sales  {
  date:any,
  user:string,
  payment_method:number,
  total_received:number,
  products:any,
  sale:number,
  isFinalized:boolean,
  bill:any
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
export class SalesFormComponent  implements OnInit ,AfterViewInit{
  public selectedClient: any;
  public selectedProduct: any;
  public productSuggestions: any[]= [];
  public clientSuggestions: any[]= [];
  public Clients:any[]= [];
  public PaymentMethods:any[]= [];
  public Products:any[]= [];
  public openDetailMerchEntry:boolean = false;
  public showTicket:boolean = false;
  @Input() registerBox:any;
  @Output() reloadBoxInfo = new EventEmitter<boolean>();
  @ViewChild('productInput') productInput!: ElementRef;
  public sales:Sales[] = [
    {
      date: this.getCurrentDate(),
      user:'',
      payment_method:1,
      total_received:0,
      products:[],
      sale:0  ,
      isFinalized:false,
      bill:null
    },
  ];
  public activeSale:Sales = this.sales[0];


  constructor(public authSvc:AuthService , private alertSvc:AlertsService, private thirdPartySvc:ThirdPartyService, private router:Router, private salesSvc:SalesService) { }

   ngOnInit() {
    this.getCurrentDate();
    this.getDisplayStock();
    this.getClients();
    this.getPaymentMethods();
  }

  ngAfterViewInit(): void {
  }

  createSale(){
     const data = {
       "date":this.activeSale.date,
       "payment_method": this.activeSale.payment_method,
       "total_received": this.activeSale.total_received,
       "sale": this.registerBox,
       "display_products": this.activeSale.products.map( (product:any) => ({
            product: product.product,
            amount: product.amount.toString()
          })
        )
     };

     this.salesSvc.createBill(data)
          .subscribe({
            error:(err:any) => {
              this.handleError(err);
            },
            next:(resp:any) => {
              console.log(resp);
              this.activeSale.isFinalized = true;
              this.reloadBoxInfo.emit(true)
              this.alertSvc.presentAlert('Éxito', 'Venta completada');
              this.selectedClient = null
              this.activeSale.bill = resp;
            }
          });
  };

  newSale(){
    const newSale = {
      date: '',
      user:'',
      payment_method:1,
      total_received:0,
      products:[],
      sale:0,
      isFinalized:false,
      bill:{}
    }

    this.sales.push(newSale);
  };

  deleteTab(i:number){
    this.sales.splice(i, 1);
    if (this.sales[0]) {
      this.activeSale = this.sales[this.sales.length - 1]
    } else{
      this.activeSale = {
        date: '',
        user:'',
        payment_method:1,
        total_received:0,
        products:[],
        sale:0,
        isFinalized:false,
        bill:{}
      }

    };
  };

  onOpenDetailMerchEntry(event:boolean) {
    this.openDetailMerchEntry = false;
  };

  getDisplayStock(){
    this.salesSvc.getDisplayStock(1000, 0)
        .subscribe({
          error:(err:any) => {
            console.log(err);
          },
          next:(resp:any) => {
            this.Products = resp.results;
          }
        });
  };

  getPaymentMethods(){
    this.salesSvc.getPaymentMethods()
        .subscribe({
          error:(err:any) => {
            console.log(err);
          },
          next:(resp:any) => {
            this.PaymentMethods = resp.results;
          }
        });
  };

  getClients(){
    this.thirdPartySvc.getClients(10000, 0)
        .subscribe({
          error:(err:any) => {
            console.log(err);

          },
          next:(resp:any) => {
            this.Clients = resp.results;
          }
        });
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
      .filter(products => products.product.name.toLowerCase().includes(event.query.toLowerCase())  )
      .map(product => `${ product.product.name}`  );
      // .map(product => `${ product.product.name} - ${product.product.code}` product.product.name );
      // || product.product.code
        // products.product?.code.toLowerCase().includes(event.query.toLowerCase())
  };

  onClientSelect(event: any) {
    let selectedClient = this.Clients.filter( (p:any) =>  p.first_name || p.last_name || p.identification_number || p.email  == event.value)
    this.activeSale.user = selectedClient[0].id;
  };

  onProductSelect(event: any) {
    // || p.code
    let selectedProduct = this.Products.find((p: any) => p.product.name === event.value);
    const productToAdd = {
      product: selectedProduct.id ,
      productName: selectedProduct.product.name,
      amount: null,
      price: selectedProduct.price,
      type_of_unit_measurement: `Ingresa la cantidad en ${selectedProduct.type_of_unit_measurement}`,
      isFinalized:false,
    };
    this.activeSale.products.push(productToAdd);
    this.selectedProduct = null


    // Usar setTimeout para asegurarse de que el DOM esté completamente renderizado antes de intentar enfocar
    setTimeout(() => {
      if (this.productInput) {
        this.productInput.nativeElement.focus();
      } else{
        console.log('no entre')
      }
    }, 200); // Retraso mínimo para esperar a que el DOM se actualice
  };

  updateTotalSaleValue(){
    this.activeSale.sale = this.activeSale.products.reduce((sum:any, product:any) => sum + (product.amount * Number(product.price)), 0);
  };

  removeProduct(index: number) {
    this.activeSale.products.splice(index, 1);
    this.updateTotalSaleValue();
  }

  onlyNumbers(event: KeyboardEvent) {
    const pressKey = event.key;
    const isNumberOrSymbol = /^[0-9.,]$/.test(pressKey);
    const controlKey = ['Backspace', 'ArrowLeft', 'ArrowRight', 'Delete', 'Tab'];

    if (!isNumberOrSymbol && !controlKey.includes(pressKey)) {
      event.preventDefault();
    };
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

      this.alertSvc.presentAlert('Ooops', errorMessage);
    } else {
      this.alertSvc.presentAlert('Ooops', 'An unexpected error occurred.');
    };
  };

  printBill(){
    sessionStorage.setItem('bill', JSON.stringify(this.activeSale.bill));
    this.router.navigateByUrl('/ticket');
  };

  getCurrentDate() {
    const currentDate = new Date();

    // Formateamos la fecha en el formato deseado: día/mes/año
    const day = String(currentDate.getDate()).padStart(2, '0');
    const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Los meses empiezan desde 0
    const year = currentDate.getFullYear();

    setTimeout(() => {
      this.activeSale.date = `${year}-${month}-${day}`
    }, 2000);
  };

}
