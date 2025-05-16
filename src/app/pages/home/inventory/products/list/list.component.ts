import { Component, OnInit, OnDestroy } from '@angular/core';
import { InventoryService } from '../../../../../core/services/inventory.service';
import { Router } from '@angular/router';
import { AlertsService } from '../../../../../core/services/alerts.service';
import { Product } from 'src/app/core/models/product';
import { PaginatedResponse } from 'src/app/core/models/global.model';
import {
  Subject,
  debounceTime,
  distinctUntilChanged,
  takeUntil,
  switchMap,
  of,
} from 'rxjs';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class ListComponent implements OnInit, OnDestroy {
  public showDeleteAlert: boolean = false;
  public isLoading: boolean = false;
  public limit: number = 10;
  public offset: number = 0;
  public search: string = '';
  public totalItems: number = 0;
  public currentPage: number = 1;
  public totalPages: number = 1;
  public pageNumbers: (number | string)[] = [];
  public Products: Product[] = [];
  public selectedProductId: string | null = null;
  public disable: boolean = false;
  public isActive: boolean = true;
  private searchSubject = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private inventorySvc: InventoryService,
    private router: Router,
    private alertSvc: AlertsService
  ) {
    // Configurar el debounce para la búsqueda con switchMap
    this.searchSubject
      .pipe(
        takeUntil(this.destroy$),
        debounceTime(300), // Esperar 300ms después de que el usuario deje de escribir
        distinctUntilChanged(), // Solo emitir si el valor ha cambiado
        switchMap((searchTerm) => {
          this.isLoading = true;
          this.search = searchTerm;
          this.currentPage = 1; // Resetear a la primera página
          this.offset = 0;

          return this.inventorySvc.getProducts(
            this.limit,
            this.offset,
            this.isActive,
            searchTerm
          );
        })
      )
      .subscribe({
        error: (err: any) => {
          console.error('Error fetching products:', err);
          this.alertSvc.presentAlert(
            'Error',
            'No se pudieron cargar los productos'
          );
          this.isLoading = false;
        },
        next: (resp: PaginatedResponse<Product>) => {
          this.Products = resp.results;
          this.totalItems = resp.count;
          this.totalPages = Math.max(
            1,
            Math.ceil(this.totalItems / this.limit)
          );
          this.updatePageNumbers();
          this.isLoading = false;
        },
      });
  }

  ngOnInit(): void {
    this.getProducts();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  getProducts(): void {
    // Solo llamar a getProducts directamente cuando no es una búsqueda
    if (!this.search) {
      this.isLoading = true;
      this.inventorySvc
        .getProducts(this.limit, this.offset, this.isActive, this.search)
        .subscribe({
          error: (err: any) => {
            console.error('Error fetching products:', err);
            this.alertSvc.presentAlert(
              'Error',
              'No se pudieron cargar los productos'
            );
            this.isLoading = false;
          },
          next: (resp: PaginatedResponse<Product>) => {
            this.Products = resp.results;
            this.totalItems = resp.count;
            this.totalPages = Math.max(
              1,
              Math.ceil(this.totalItems / this.limit)
            );
            this.updatePageNumbers();
            this.isLoading = false;
          },
        });
    }
  }

  updatePageNumbers(): void {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (this.totalPages <= maxVisiblePages) {
      this.pageNumbers = Array.from(
        { length: this.totalPages },
        (_, i) => i + 1
      );
      return;
    }

    // Siempre mostrar primera página
    pages.push(1);

    // Calcular el rango de páginas alrededor de la página actual
    let startPage = Math.max(2, this.currentPage - 1);
    let endPage = Math.min(this.totalPages - 1, this.currentPage + 1);

    // Ajustar el rango si estamos cerca de los extremos
    if (this.currentPage <= 3) {
      endPage = Math.min(4, this.totalPages - 1);
    } else if (this.currentPage >= this.totalPages - 2) {
      startPage = Math.max(2, this.totalPages - 3);
    }

    // Agregar puntos suspensivos y páginas según corresponda
    if (startPage > 2) {
      pages.push('...');
    }

    // Agregar páginas del rango medio
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    // Agregar puntos suspensivos si hay espacio entre el rango medio y la última página
    if (endPage < this.totalPages - 1) {
      pages.push('...');
    }

    // Siempre mostrar última página si hay más de una página
    if (this.totalPages > 1) {
      pages.push(this.totalPages);
    }

    this.pageNumbers = pages;
  }

  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages || page === this.currentPage) {
      return;
    }
    this.currentPage = page;
    this.offset = (page - 1) * this.limit;
    this.getProducts();
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.goToPage(this.currentPage + 1);
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.goToPage(this.currentPage - 1);
    }
  }

  onDelete(id: string, isDisable: boolean): void {
    this.selectedProductId = id;
    this.disable = isDisable;
    this.showDeleteAlert = true;
  }

  delete(event: boolean): void {
    if (event && this.selectedProductId !== null) {
      this.deleteProduct();
    } else {
      this.showDeleteAlert = false;
      this.selectedProductId = null;
    }
  }

  goToUpdate(product: Product): void {
    sessionStorage.setItem('product', JSON.stringify(product));
    this.router.navigateByUrl(`/home/inventory/products/update/${product.id}`);
  }

  deleteProduct(): void {
    if (this.selectedProductId === null) return;

    this.isLoading = true;
    const data = { is_active: this.disable };

    this.inventorySvc.disableProduct(this.selectedProductId, data).subscribe({
      error: (err: any) => {
        this.alertSvc.presentAlert(
          'Error',
          err.error.message || 'No se pudo actualizar el producto'
        );
        this.showDeleteAlert = false;
        this.selectedProductId = null;
        this.isLoading = false;
      },
      next: () => {
        this.getProducts();
        this.showDeleteAlert = false;
        this.selectedProductId = null;
        this.alertSvc.presentAlert(
          'Éxito',
          'Producto actualizado correctamente'
        );
      },
    });
  }

  // Helper methods for template
  isNumber(value: number | string): boolean {
    return typeof value === 'number';
  }

  isString(value: number | string): boolean {
    return typeof value === 'string';
  }

  getPageNumber(page: number | string): number {
    return typeof page === 'number' ? page : 0;
  }

  // Método para manejar la búsqueda
  onSearch(event: Event): void {
    const searchTerm = (event.target as HTMLInputElement).value;
    this.searchSubject.next(searchTerm);
  }
}
