import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { Router } from '@angular/router';
import {  AutoCompleteModule } from 'primeng/autocomplete';
import { AlertController, IonicModule } from '@ionic/angular';
import { SalesService } from '../../core/services/sales.service';
import { AlertsService } from '../../core/services/alerts.service';
import { ThirdPartyService } from '../../core/services/third-party.service';

interface AutoCompleteCompleteEvent {
  originalEvent: Event;
  query: string;
}

export interface Sales  {
  date:string,
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
export class SalesFormComponent  implements OnInit {
  selectedClient: any;
  selectedProduct: any;
  productSuggestions: any[]= [];
  clientSuggestions: any[]= [];
  public Clients:any[]= [];
  public PaymentMethods:any[]= [];
  public Products:any[]= [];
  public openDetailMerchEntry:boolean = false;
  public showTicket:boolean = false;
  @Input() registerBox:any;
  @Output() reloadBoxInfo = new EventEmitter<boolean>();
  public sales:Sales[] = [
    {
      date:'',
      user:'',
      payment_method:1,
      total_received:0,
      products:[],
      sale:0  ,
      isFinalized:false,
      bill:null
     },
  ];

  activeSale:Sales = this.sales[0];

  constructor(private alertController:AlertController, private alertSvc:AlertsService, private thirdPartySvc:ThirdPartyService, private router:Router, private salesSvc:SalesService) { }

  ngOnInit() {
    this.getDisplayStock();
    this.getClients();
    this.getPaymentMethods();


  }


  // Método para manejar el envío del formulario
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
              console.log(err);
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
      date:'',
      user:'',
      payment_method:1,
      total_received:0,
      products:[],
      sale:0,
      isFinalized:false,
      bill:{}
    }

    this.sales.push(newSale);
    console.log(this.sales)
  };

  deleteTab(i:number){
    this.sales.splice(i, 1);
    if (this.sales[0]) {
      this.activeSale = this.sales[this.sales.length - 1]
    } else{
      this.activeSale = {
        date:'',
        user:'',
        payment_method:1,
        total_received:0,
        products:[],
        sale:0,
        isFinalized:false,
        bill:{}
      }

    }
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
            console.log(resp)
            this.Products = resp.results;

          }
        })
  };

  getPaymentMethods(){
    this.salesSvc.getPaymentMethods()
        .subscribe({
          error:(err:any) => {
            console.log(err);
          },
          next:(resp:any) => {
            console.log(resp)
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
            console.log(this.Clients)
          }
        });
  };

  searchClients(event: any) {
    console.log(event)
    let value = event.query
    this.clientSuggestions = this.Clients
      .filter(client => client.first_name.toLowerCase().includes(value.toLowerCase()) ||
              client.last_name.toLowerCase().includes(value.toLowerCase()) ||
              client.identification_number.toLowerCase().includes(value.toLowerCase()) ||
              client.email.toLowerCase().includes(value.toLowerCase())
              )
      .map(client => client.first_name || client.last_name || client.identification_number || client.email);
  }

  searchProducts(event: AutoCompleteCompleteEvent) {
    this.productSuggestions = this.Products
      .filter(products => products.product.name.toLowerCase().includes(event.query.toLowerCase())  )
      .map(product => `${ product.product.name}`  );
      // .map(product => `${ product.product.name} - ${product.product.code}` product.product.name );
      // || product.product.code
        // products.product?.code.toLowerCase().includes(event.query.toLowerCase())
  }

  onClientSelect(event: any) {
    let selectedClient = this.Clients.filter( (p:any) =>  p.first_name || p.last_name || p.identification_number || p.email  == event.value)
    this.activeSale.user = selectedClient[0].id;

  };

  onProductSelect(event: any) {
    // || p.code
    let selectedProduct = this.Products.find((p: any) => p.product.name === event.value);
    console.log(selectedProduct)
    const productToAdd = {
      product: selectedProduct.id ,
      productName: selectedProduct.product.name,
      amount: null,
      price: selectedProduct.price,
      type_of_unit_measurement: `Ingresa la cantidad en ${selectedProduct.type_of_unit_measurement}`,
      isFinalized:false,

    }
    this.activeSale.products.push(productToAdd);
    this.selectedProduct = null

    console.log( this.activeSale);
  };

  updateTotalSaleValue(){
    this.activeSale.sale = this.activeSale.products.reduce((suma:any, producto:any) => suma + (producto.amount * Number(producto.price)), 0);
  }

  removeProduct(index: number) {
    this.activeSale.products.splice(index, 1);  // Elimina el producto del arreglo
    this.updateTotalSaleValue();  // R

  }

  onlyNumbers(event: KeyboardEvent) {
    const pressKey = event.key;
    // Permitir solo números (0-9), teclas de control (como Backspace) y signos como "-" y "."
    const isNumber = /^[0-9]$/.test(pressKey);
    const controlKey = ['Backspace', 'ArrowLeft', 'ArrowRight', 'Delete', 'Tab'];

    if (!isNumber && !controlKey.includes(pressKey)) {
      event.preventDefault(); // Bloquear la tecla si no es válida
    }
  }
  selectTab( data:any) {
    this.activeSale = data;
  };

  handleError(err: any) {
    if (err.error) {
      // Obtenemos todas las claves (nombres de los campos)
      const errorKeys = Object.keys(err.error);

      // Creamos un mensaje para la alerta con todos los errores
      let errorMessage = '';
      errorKeys.forEach(key => {
        // Concatenamos el nombre del campo y el mensaje de error
        errorMessage += ` ${err.error[key]}\n`;
      });

      // Mostrar alerta con el mensaje de error concatenado
      this.alertSvc.presentAlert('Ooops', errorMessage);
    } else {
      // Si no hay errores específicos en err.error, mostrar un mensaje general
      this.alertSvc.presentAlert('Ooops', 'An unexpected error occurred.');
    };
  };

  printBill(){
    sessionStorage.setItem('bill', JSON.stringify(this.activeSale.bill))
    this.router.navigateByUrl('/ticket')
  }




}
