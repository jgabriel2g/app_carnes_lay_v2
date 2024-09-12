import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AlertsService } from '../../core/services/alerts.service';
import { InventoryService } from '../../core/services/inventory.service';
import { ThirdPartyService } from '../../core/services/third-party.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-merchandise-entry-product-detail',
  templateUrl: './merchandise-entry-product-detail.component.html',
  styleUrls: ['./merchandise-entry-product-detail.component.scss'],
  standalone:true,
  imports:[
    CommonModule,
    ReactiveFormsModule,
    IonicModule
  ]
})
export class MerchandiseEntryProductDetailComponent  implements OnInit {
  @Input() stockId:any;
  @Input() productId:any;
  @Output() close = new EventEmitter<boolean>();
  stockDetail:any[] = [];
  weightTypes:any[] = [];
  unitTypes:any[] = [];
  productForm!: FormGroup;
  public isLoading:boolean = false;

  ngOnInit(): void {
    console.log(this.stockId, this.productId)
    this.getUnitTypes();
    this.getWeightTypes();
    this.getStockDetail();
    this.productForm = this.fb.group({
      product: [this.productId],  // productId assigned to product field
      stock: [this.stockId],      // stockId assigned to stock field
      unit: [0, [Validators.required, Validators.min(1)]],
      type_of_unit: [0 , [Validators.required, Validators.min(1)]],
      weight: ['', [Validators.required, Validators.min(.5)]],
      type_of_weight: [0, [Validators.required, Validators.min(1)]],
    });
  }
  constructor(private fb: FormBuilder, private alertSvc:AlertsService, private inventorySvc:InventoryService, private thirdParySvc:ThirdPartyService) { }
  public showInventoryMenu:boolean = false;


  actionResponse(value:boolean) {
    this.close.emit(value);
  };

  addStockDetail(){
    this.isLoading = !this.isLoading;
    const data = {
      "product": this.productId,
      "stock": this.stockId,
      "unit": this.productForm.get('unit')?.value,
      "type_of_unit": this.productForm.get('type_of_unit')?.value,
      "weight": this.productForm.get('weight')?.value,
      "type_of_weight": this.productForm.get('type_of_weight')?.value,
    }
    this.inventorySvc.addStockDetail(data)
    .subscribe({
      error:(err:any) => {
        console.log(err);
        this.handleError(err)
        this.isLoading = !this.isLoading;
      },
      next:(resp:any) => {
        this.getStockDetail()
        this.alertSvc.presentAlert('Éxito', 'Detalle agregado')
        this.isLoading = !this.isLoading;
      }
    })

  };

  getStockDetail(){
      this.inventorySvc.getStockDetail(this.stockId)
          .subscribe({
            error:(err:any) =>{
             this.handleError(err);
            },
            next:(resp:any) => {
              console.log(resp);
              this.stockDetail = resp.results;
            }
          })
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


  getWeightTypes(){
    this.inventorySvc.getWeightTypes()
        .subscribe({
          error:(err:any) => {
            console.log(err);
          },
          next:(resp:any) => {
            this.weightTypes = resp.results;
          }
        });
  };

  getUnitTypes(){
    this.inventorySvc.getUnitTypes()
        .subscribe({
          error:(err:any) => {
            console.log(err);
          },
          next:(resp:any) => {
            this.unitTypes = resp.results;
          }
        });
  };
}
