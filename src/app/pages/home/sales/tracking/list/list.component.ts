import { Component, OnInit } from '@angular/core';
import { SalesService } from '../../../../../core/services/sales.service';
import { AlertsService } from '../../../../../core/services/alerts.service';
import { AlertController } from '@ionic/angular';
import { AuthService } from '../../../../../core/services/auth.service';
import {Sale} from "../../../../../core/models/sale.model";

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class ListComponent  implements OnInit {

  public limit = 10;
  public offset = 0;
  public search = '';
  public saleId = '';
  public totalItems = 0;
  public currentPage = 1;
  public totalPages = 1;
  public isLoading = false;
  public showDetailBills = false;
  public Sales:Sale[] = [];
  public pageNumbers: (number | string)[] = [];

  constructor(
    public authSvc:AuthService,
    private salesSvc:SalesService,
    private alertSvc:AlertsService,
  ) { }

  ngOnInit() {
    this.getSales();
  };

  getSales() {
    this.isLoading = true;
    this.salesSvc.getSales(this.limit, this.offset).subscribe({
      next: (resp) => {
        this.Sales = resp.results;
        this.totalItems = resp.count;
        this.totalPages = Math.ceil(this.totalItems / this.limit);
        this.isLoading = false;
        this.updatePageNumbers();
      },
      error: async (err) => {
        console.log(err);
        this.isLoading = false;
        await this.handleError(err);
      },
    });
  };

  deleteSale(id: string) {
      this.salesSvc.deleteSale(id)
          .subscribe({
            error: async (err:any) =>{
              await this.handleError(err);
            },
            next: async () => {
              await this.alertSvc.presentAlert('Éxito', 'Venta eliminada');
              this.getSales();
            }
          });
  };

  /**
   * Construye la lista de páginas a mostrar con elipsis.
   * Ejemplo de salida: [1, '...', 3, 4, 5, 6, 7, '...', 20]
   */
  updatePageNumbers(): void {
    const total = this.totalPages;
    const current = this.currentPage;
    const maxVisible = 5;
    const pages: (number | string)[] = [];

    if (total <= maxVisible + 2) {
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
      this.pageNumbers = pages;
      return;
    }

    if (current > 3) {
      pages.push(1);
      if (current > 4) {
        pages.push('...');
      }
    }

    const start = Math.max(current - 2, 1);
    const end = Math.min(current + 2, total);

    for (let i = start; i <= end; i++) {
      if (!pages.includes(i)) {
        pages.push(i);
      }
    }

    if (end < total) {
      if (end < total - 1) {
        pages.push('...');
      }
      pages.push(total);
    }

    this.pageNumbers = pages;
  }

  goToPage(page: number | string): void {
    if (typeof page === 'string') {
      return;
    }
    this.currentPage = page;
    this.offset = (page - 1) * this.limit;
    this.getSales();
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.offset += this.limit;
      this.getSales();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.offset -= this.limit;
      this.getSales();
    }
  }


  showSalesDetail(saleId:string){
    this.saleId = saleId;
    this.showDetailBills = !this.showDetailBills;
  };

  closeDetailModal(event:boolean) {
    this.showDetailBills = false;
    this.getSales();
  }

  async handleError(err: any) {
    if (err?.error) {
      const errorMessage = Object.values(err.error).join('\n');
      await this.alertSvc.presentAlert('Ooops', errorMessage);
    } else {
      await this.alertSvc.presentAlert('Ooops', 'An unexpected error occurred.');
    }
  }
}
