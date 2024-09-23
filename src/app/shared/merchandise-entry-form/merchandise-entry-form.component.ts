import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {  AutoCompleteModule } from 'primeng/autocomplete';
import { CommonModule } from '@angular/common';
import { MerchandiseEntryProductDetailComponent } from '../merchandise-entry-product-detail/merchandise-entry-product-detail.component';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { InventoryService } from '../../core/services/inventory.service';
import { AlertsService } from '../../core/services/alerts.service';
import { ThirdPartyService } from '../../core/services/third-party.service';
import { IonicModule } from '@ionic/angular';
import { AuthService } from '../../core/services/auth.service';


interface AutoCompleteCompleteEvent {
  originalEvent: Event;
  query: string;
}

@Component({
  selector: 'app-merchandise-entry-form',
  templateUrl: './merchandise-entry-form.component.html',
  styleUrls: ['./merchandise-entry-form.component.scss'],
  standalone:true,
  imports: [
    FormsModule,
    AutoCompleteModule,
    FormsModule,
    CommonModule,
    MerchandiseEntryProductDetailComponent,
    IonicModule,
    RouterModule
  ]
})
export class MerchandiseEntryFormComponent  implements OnInit {
  public Providers:any[] =[];
  public Products:any[] =[];
  public UnitTypes:any[] =[];
  public WeightTypes:any[] =[];
  public suggestions: string[] = [];
  public selectedItem: string = '';
  public selectedProducts: any[] = []; // Aquí almacenarás los productos seleccionados
  public openDetailMerchEntry:boolean = false;
  public isLoading:boolean = false;
  public unitType:any = 0;
  public Stock:any[] = [];
  public stockLimit:number = 10;
  public stockOffset:number = 0;
  public productId:any;
  public stockId:any;
  public providerId:any = "";
  public weightType:any = 0;
  public productPrice:number = 0;
  public purchaseId:any;
  public purchaseInfo:any;
  constructor(public authSvc:AuthService, private activatedRoute:ActivatedRoute, private router:Router, private inventorySvc:InventoryService, private alertSvc:AlertsService, ) { }

  ngOnInit() {
    this.activatedRoute.params.subscribe(({id}) => {
        this.purchaseId = id;
        this.getStock();
    })
    this.getProducts();
    this.getUnitTypes();
    this.getTypeWeight();
  }


  createPurchaseStockEntry(){
    if (this.providerId > 0 && this.Stock.length ) {
      this.isLoading = !this.isLoading;
      const data = {
        "provider": this.providerId,
        "status":2 ,
      }

      this.inventorySvc.updatePurchase(data, this.purchaseId)
        .subscribe({
          error:(err:any) => {
            this.handleError(err);
            this.isLoading = !this.isLoading;
          },
          next:(resp:any) =>{
            this.alertSvc.presentAlert('Éxito', 'Cargue de mercancía guardado');
            this.router.navigateByUrl('/home/inventory/merchandiseEntry')
            this.isLoading = !this.isLoading;
          }
        })
    } else {
      this.alertSvc.presentAlert('Oooops', 'Debes seleccionar un proveedor y al menos cargar un producto y su detalle')
    };
  };

  search(event: AutoCompleteCompleteEvent) {
    this.suggestions = this.Products
      .filter(product => product.name.toLowerCase().includes(event.query.toLowerCase()))
      .map(product => product.name);
  };

  onProductSelect(event: any) {
    const selectedProduct = this.Products.find(product => product.name === event.value);
    if (selectedProduct) {
      this.selectedProducts.push(selectedProduct);
    };
  };

  onOpenDetailMerchEntry(event:boolean) {
    this.openDetailMerchEntry = false;
    this.getStock();
  };

  loadStockDetailModal(s:any){
     this.openDetailMerchEntry = !this.openDetailMerchEntry;
     this.productId = s?.product.id;
     this.stockId = s?.id
  };

  createStock(){
    this.isLoading = !this.isLoading;
    const data = {
      "product": this.selectedProducts[0].id,
      "presentation_unit":Number( this.unitType),
      "price": this.productPrice.toString(),
      "purchase": Number(this.purchaseId),
      "type_of_weight": Number(this.weightType)
    };

    this.inventorySvc.createStock(data)
      .subscribe({
        error:(err:any) => {
          this.handleError(err);
          this.isLoading = !this.isLoading;
        },
        next:(resp:any) => {
          this.selectedProducts = [];
          this.selectedItem = '';
          this.productPrice = 0;
          this.unitType = 0;
          this.weightType = 0;
          this.getStock();
          this.Stock = resp.results;
          this.isLoading = !this.isLoading;
        }
      });
  };

  getStock(){
    this.inventorySvc.getPurchaseById(this.purchaseId)
        .subscribe({
          error:(err:any) => {
            console.log(err);
            this.handleError(err);
          },
          next:(resp:any) => {
            this.purchaseInfo =resp;
            this.providerId = this.purchaseInfo.provider.id;
            this.Stock = resp.stocks;
          }
        });
  };

  getProducts(){
    this.inventorySvc.getProducts(1000, 0, true)
          .subscribe({
            error:(err:any) => {
            this.handleError(err);
            },
            next:(resp:any) => {
              this.Products = resp.results;
            }
          });
  };

  getUnitTypes(){
    this.inventorySvc.getUnitTypes()
        .subscribe({
          error:(err:any) => {
            console.log(err);
            this.handleError(err);
          },
          next:(resp:any) => {
            this.UnitTypes = resp.results;
          }
        });
  };

  getTypeWeight(){
    this.inventorySvc.getWeightTypes()
          .subscribe({
            error:(err:any) => {
              console.log(err);
              this.handleError(err);
            },
            next:(resp:any) => {
              this.WeightTypes  = resp.results;
            }
          });
  };

  handleError(err: any) {
    if (err.error) {
      const errorKeys = Object.keys(err.error);

      let errorMessage = '';
      errorKeys.forEach(key => {
        errorMessage += ` ${err.error[key]}\n`;
      });

    } else {
      this.alertSvc.presentAlert('Ooops', 'An unexpected error occurred.');
    };
  };
}
