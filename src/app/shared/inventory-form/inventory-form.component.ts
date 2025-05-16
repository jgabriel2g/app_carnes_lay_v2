import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { InventoryService } from '../../core/services/inventory.service';
import { AlertsService } from '../../core/services/alerts.service';
import { Category, Tax } from '../../core/models/product';

@Component({
  selector: 'app-inventory-form',
  templateUrl: './inventory-form.component.html',
  styleUrls: ['./inventory-form.component.scss'],
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, RouterModule, CommonModule],
})
export class InventoryFormComponent implements OnInit {
  @Output() formSubmit: EventEmitter<any> = new EventEmitter<any>();
  @Input() productInfo: any;
  public productForm: FormGroup;
  public isLoading: boolean = false;
  public Categories: Category[] = [];
  public Taxes: Tax[] = [];

  constructor(
    private inventorySvc: InventoryService,
    private fb: FormBuilder,
    private alertSvc: AlertsService
  ) {
    this.productForm = this.fb.group({
      code: ['', [Validators.required, Validators.minLength(1)]],
      name: ['', [Validators.required, Validators.minLength(3)]],
      category: [0, [Validators.required, Validators.min(1)]],
      tax: [0, [Validators.required, Validators.min(1)]],
      is_inventory: [false],
      is_tax: [false],
    });

    // Actualizar validación de tax cuando cambia is_tax
    this.productForm.get('is_tax')?.valueChanges.subscribe((isTax) => {
      const taxControl = this.productForm.get('tax');
      if (isTax) {
        taxControl?.setValidators([Validators.required, Validators.min(1)]);
      } else {
        taxControl?.clearValidators();
        taxControl?.setValue(0);
      }
      taxControl?.updateValueAndValidity();
    });
  }

  ngOnInit() {
    this.getCategories();
    this.getTaxes();
    if (this.productInfo) {
      this.productForm.patchValue({
        code: this.productInfo.code,
        name: this.productInfo.name,
        category: this.productInfo.category?.id || 0,
        tax: this.productInfo.tax?.id || 0,
        is_inventory: this.productInfo.is_inventory,
        is_tax: this.productInfo.is_tax,
      });
    }
  }

  onSubmit(): void {
    this.isLoading = true;
    this.productForm.markAllAsTouched();

    if (this.productForm.valid) {
      const formValue = this.productForm.value;
      // Si no tiene impuesto, no enviamos el campo tax
      if (!formValue.is_tax) {
        delete formValue.tax;
      }
      this.formSubmit.emit(formValue);
    } else {
      this.alertSvc.presentAlert(
        'Error',
        'Por favor revisa los campos marcados en rojo'
      );
      this.isLoading = false;
    }
  }

  getCategories() {
    this.inventorySvc.getProductCategories().subscribe({
      error: (err: any) => {
        console.error('Error al obtener categorías:', err);
        this.alertSvc.presentAlert(
          'Error',
          'No se pudieron cargar las categorías'
        );
      },
      next: (resp: any) => {
        this.Categories = resp.results;
      },
    });
  }

  getTaxes() {
    this.inventorySvc.getTaxes().subscribe({
      error: (err: any) => {
        console.error('Error al obtener impuestos:', err);
        this.alertSvc.presentAlert(
          'Error',
          'No se pudieron cargar los impuestos'
        );
      },
      next: (resp: any) => {
        this.Taxes = resp.results;
      },
    });
  }
}
