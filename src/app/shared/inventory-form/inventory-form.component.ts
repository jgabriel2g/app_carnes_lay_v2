import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { InventoryService } from '../../core/services/inventory.service';
import { AlertsService } from '../../core/services/alerts.service';

@Component({
  selector: 'app-inventory-form',
  templateUrl: './inventory-form.component.html',
  styleUrls: ['./inventory-form.component.scss'],
  standalone:true,
  imports:[
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    CommonModule
  ]
})
export class InventoryFormComponent  implements OnInit {
  @Output() formSubmit: EventEmitter<any> = new EventEmitter<any>();
  @Input() productInfo:any;
  public productForm: FormGroup;
  public isLoading:boolean = false;
  public Categories:any[] =[];
  constructor(private inventorySvc:InventoryService, private fb: FormBuilder, private alertSvc:AlertsService) {
    this.productForm = this.fb.group({
      code: ['', [Validators.required]],
      name: ['', Validators.required],
      category: [0, [Validators.required, Validators.min(0)]],
      is_inventory: [true],
      is_tax: [true]
    });
  }

  ngOnInit() {
    this.getCategories();
    if (this.productInfo !== undefined) {
      this.productForm.get('code')?.setValue(this.productInfo.code)
      this.productForm.get('name')?.setValue(this.productInfo.name)
      this.productForm.get('is_inventory')?.setValue(this.productInfo.is_inventory)
      this.productForm.get('is_tax')?.setValue(this.productInfo.is_tax);
    }
  }

  onSubmit(): void {
    this.isLoading = !this.isLoading
    this.productForm.markAllAsTouched();
    if (this.productForm.valid) {
      this.formSubmit.emit(this.productForm.value);
      this.isLoading = !this.isLoading
    } else {
      this.alertSvc.presentAlert('Ooops', 'Revisa los campos')
      this.isLoading = !this.isLoading
    };
  };

  getCategories(){
    this.inventorySvc.getProductCategories()
        .subscribe({
          error:(err:any) => {
            console.log(err);
          },
          next:(resp:any) => {
            this.Categories = resp.results
          }
        });
  };

}
