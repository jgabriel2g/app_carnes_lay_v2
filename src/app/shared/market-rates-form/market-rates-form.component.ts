import { AutoCompleteModule } from 'primeng/autocomplete';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { InventoryService } from '../../core/services/inventory.service';
import { AlertsService } from '../../core/services/alerts.service';
import { AuthService } from '../../core/services/auth.service';
interface AutoCompleteCompleteEvent {
  originalEvent: Event;
  query: string;
}
@Component({
  selector: 'app-market-rates-form',
  templateUrl: './market-rates-form.component.html',
  styleUrls: ['./market-rates-form.component.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    RouterModule,
    AutoCompleteModule,
  ],
})
export class MarketRatesFormComponent implements OnInit {
  @Output() formSubmit: EventEmitter<any> = new EventEmitter<any>();
  public suggestions: any[] = [];
  public Products: any[] = [];
  public selectedProduct: string = '';
  public selectedItem: string = '';
  public description: string = '';
  public price: number = 0;
  public isLoading: boolean = false;
  constructor(
    private inventorySvc: InventoryService,
    private alertSvc: AlertsService,
    public authSvc: AuthService
  ) {}

  ngOnInit() {
    this.getProducts();
  }

  search(event: AutoCompleteCompleteEvent) {
    this.suggestions = this.Products.filter((product) =>
      product.name.toLowerCase().includes(event.query.toLowerCase())
    ).map((product) => product.name);
  }

  onProductSelect(event: any) {
    const selectedProduct = this.Products.find(
      (product) => product.name === event.value
    );
    if (selectedProduct) {
      this.selectedProduct = selectedProduct.id;
    }
  }

  getProducts() {
    this.inventorySvc.getProducts(1000, 0, true, '').subscribe({
      error: (err: any) => {
        this.handleError(err);
      },
      next: (resp: any) => {
        this.Products = resp.results;
      },
    });
  }

  handleError(err: any) {
    if (err.error) {
      const errorKeys = Object.keys(err.error);
      let errorMessage = '';
      errorKeys.forEach((key) => {
        errorMessage += ` ${err.error[key]}\n`;
      });
    } else {
      this.alertSvc
        .presentAlert('Ooops', 'An unexpected error occurred.')
        .then();
    }
  }

  sendMarketRate() {
    if (
      this.selectedProduct !== '' &&
      this.description.length &&
      this.price > 0
    ) {
      this.formSubmit.emit({
        product: this.selectedProduct,
        description: this.description,
        price: this.price,
      });
    } else {
      this.alertSvc.presentAlert('Oooops', 'Porfavor llena todos los campos');
    }
  }
}
