import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AutoCompleteCompleteEvent } from 'primeng/autocomplete';
import { InventoryService } from '../../../../../core/services/inventory.service';
import { SalesService } from '../../../../../core/services/sales.service';
import { AlertsService } from '../../../../../core/services/alerts.service';

@Component({
  selector: 'app-load-new',
  templateUrl: './load-new.component.html',
  styleUrls: ['./load-new.component.scss'],
})
export class LoadNewComponent  implements OnInit {
  public unitTypes:any[] = [];
  public products:any[] = [];
  public suggestions: string[] = [];
  public selectedItem: string = '';
  public productForm: FormGroup;
  @Output() close = new EventEmitter<boolean>();
  @Input() displayStockId?: string;
  ngOnInit(): void {
    this.resetForm();

    if (this.displayStockId !== undefined) {
        this.getDisplayStock();
        this.productForm.get('quantityToAdd')?.enable();
        this.productForm.get('quantity')?.disable();
    } else {
      this.productForm.get('quantityToAdd')?.disable();
      this.getUnitTypes();
      this.getProducts();
    }
  };

  private resetForm() {
    this.productForm.reset();
    this.displayStockId = undefined;
  }

  constructor(private alertSvc:AlertsService, private fb: FormBuilder , private inventorySvc:InventoryService, private salesSvc:SalesService) {
    this.productForm = this.fb.group({
      product: [0, Validators.required],
      quantity: [0, [Validators.required, Validators.min(1), Validators.pattern('^[0-9]*$')]],
      quantityToAdd: [0, [Validators.required, Validators.min(0), Validators.pattern('^[0-9]*$')]],
      type_of_unit_measurement: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(1), Validators.pattern('^[0-9]*\.?[0-9]+$')]]
    });
   }


  actionResponse(value:boolean) {
    if (value) {
      this.productForm.markAllAsTouched();
      if (this.productForm.valid) {
        if (this.displayStockId !== undefined) {
          const data = {
            quantity: Number(this.productForm.get('quantity')?.value) + Number(this.productForm.get('quantityToAdd')?.value),
            price: this.productForm.get('price')?.value
          }
          this.salesSvc.updateDisplayStock(data, this.displayStockId)
          .subscribe({
            error:(err:any) => {
             this.handleError(err)
            },
            next:(resp:any) => {
              this.alertSvc.presentAlert('Éxito', 'Producto actualizado al punto de venta');
              this.close.emit(value);
            }
          })
        } else  {
          this.salesSvc.createDisplayStock(this.productForm.value)
              .subscribe({
                error:(err:any) => {
                 this.handleError(err)
                },
                next:(resp:any) => {
                  this.alertSvc.presentAlert('Éxito', 'Producto cargado al punto de venta');
                  this.close.emit(value);
                }
              })
        };
      } else {
        this.alertSvc.presentAlert('Ooops', 'Revisa los campos');
      };
    } else {
      this.close.emit(value);
    };
  };

  getDisplayStock(){
    this.salesSvc.getDisplayStockById(this.displayStockId)
          .subscribe({
            error:(err:any) =>{
              this.handleError(err);
            },
            next:(resp:any) => {
              this.getUnitTypes();
              this.getProducts();
              this.productForm.get('product')?.setValue(resp.product.id);
              this.productForm.get('quantity')?.setValue(Number(resp.quantity));
              this.productForm.get('type_of_unit_measurement')?.setValue(resp.type_of_unit_measurement.id);
              this.productForm.get('price')?.setValue(resp.price);
              this.selectedItem = resp.product.name;
            }
          });
  };

  getUnitTypes(){
    this.inventorySvc.getUnitTypes()
      .subscribe({
        error:(err:any) => {
         this.handleError(err);
        },
         next:(resp:any) => {
           this.unitTypes = resp.results;
           console.log(this.unitTypes)
         }
      });
  };

  getProducts(){
    this.inventorySvc.getProducts(100,0, true)
          .subscribe({
            error:(err:any) => {
              this.handleError(err);
            },
            next:(resp:any) =>{
              this.products = resp.results;
            }
          });
  };

  search(event: AutoCompleteCompleteEvent) {
    this.suggestions = this.products
      .filter(product => product.name.toLowerCase().includes(event.query.toLowerCase()))
      .map(product => product.name);
  };

  onProductSelect(event: any) {
    let selectedProduct = this.products.filter( (p:any) => p.name == event.value)
    this.productForm.get('product')?.setValue(selectedProduct[0].id);
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
}
