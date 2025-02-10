import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import {Platform} from '@ionic/angular';
import { SalesService } from '../../../../../core/services/sales.service';
import { AlertsService } from '../../../../../core/services/alerts.service';
import {Router} from "@angular/router";
import {BillSummary, Sale} from "../../../../../core/models/sale.model";
import {mapToCamelCase} from "../../../../../core/utils/mapper";

@Component({
  selector: 'app-sale-bills',
  templateUrl: './sale-bills.component.html',
  styleUrls: ['./sale-bills.component.scss'],
})
export class SaleBillsComponent  implements OnInit {
  @Input() sale: string = '';
  @Output() closed = new EventEmitter<boolean>();

  bills: BillSummary[] = [];
  limit = 15;
  offset = 0;
  totalItems = 0;
  currentPage = 1;
  totalPages = 1;
  pageNumbers: (number | string)[] = [];

  clientSelected = '';
  isLoading = false;
  isMobile = false;

  constructor(
    private alertSvc:AlertsService,
    private salesSvc:SalesService,
    private router:Router,
    private platform: Platform
  ) { }

  ngOnInit() {
    this.getBills();
    this.isMobile = this.platform.is('mobile');
  }

  /**
   * Obtiene la lista de facturas asociadas a la venta (sale).
   */
  getBills(): void {
    this.isLoading = true;
    this.bills = [];
    this.salesSvc.getBillsBySale(this.limit, this.offset, this.sale, this.clientSelected)
      .subscribe({
        next: resp => {
          this.bills = resp.results;
          this.totalItems = resp.count;
          this.totalPages = Math.ceil(this.totalItems / this.limit);
          this.updatePageNumbers();
          this.isLoading = false;
        },
        error: err => {
          console.error(err);
          this.isLoading = false;
          this.handleError(err);
        }
      });
  }

  /**
   * Muestra detalles de la factura seleccionada (Navega a /ticket).
   */
  showBillDetail(billId: string){
    this.salesSvc.getBillById(billId).subscribe({
      next: bill => {
        this.router.navigateByUrl('/ticket', { state: { bill } }).then();
      },
      error: err => console.error(err)
    });
  }

  /**
   * Elimina una factura (Bill).
   */
  deleteBill(billId: string): void {
    this.salesSvc.deleteBillSale(billId)
      .subscribe({
        next: () => {
          this.alertSvc.presentAlert('Éxito', 'Factura eliminada');
          this.closeModal();
        },
        error: err => {
          console.error(err);
          this.handleError(err);
        }
      });
  }

  /**
   * Cierra el modal (emite evento al componente padre).
   */
  closeModal(): void {
    this.closed.emit(true);
  }

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

  /**
   * Ir a una página específica en la paginación.
   */
  goToPage(page: number | string): void {
    if (typeof page === 'string') {
      return;
    }
    this.currentPage = page;
    this.offset = (page - 1) * this.limit;
    this.getBills();
  }

  /**
   * Página siguiente en la paginación.
   */
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.offset += this.limit;
      this.getBills();
    }
  }

  /**
   * Página anterior en la paginación.
   */
  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.offset -= this.limit;
      this.getBills();
    }
  }

  /**
   * Imprimir detalles de la venta (Ticket).
   */
  printSaleDetails(): void {
    this.salesSvc.getBoxSaleById(this.sale).subscribe({
      next: resp => {
        const result = resp as Sale;
        result.isMobile = this.isMobile;
        this.router.navigateByUrl('/daily-ticket', { state: { sale: result } }).then();
      },
      error: err => console.error(err)
    });
  }

  /**
   * Enviar factura a la DIAN.
   */
  sendToDian(billId: string): void {
    this.salesSvc.sendToDian(billId).subscribe({
      next: () => {
        this.alertSvc.presentAlert('Éxito', 'Factura enviada a la Dian');
      },
      error: err => {
        console.error(err);
        this.handleError(err);
      }
    });
  }

  /**
   * Abre el PDF en una nueva pestaña.
   */
  viewPdf(url: string): void {
    window.open(url, '_blank');
  }

  /**
   * Lógica centralizada para manejar errores de la API.
   */
  handleError(err: any): void {
    if (err?.error) {
      const errorMessage = Object.values(err.error).join('\n');
      this.alertSvc.presentAlert('Ooops', errorMessage);
    } else {
      this.alertSvc.presentAlert('Ooops', 'An unexpected error occurred.');
    }
  }
}
