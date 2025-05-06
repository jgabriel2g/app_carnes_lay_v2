import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { addIcons } from 'ionicons';
import { refreshOutline } from 'ionicons/icons';
import { MetricsService } from 'src/app/core/services/metrics.service';
import { MetricProduct, MetricResponse } from 'src/app/core/models/metric';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-metricas-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
})
export class MainComponent implements OnInit {
  isLoading: boolean = true;
  isTableLoading: boolean = false;
  metrics: MetricResponse | null = null;
  error: string | null = null;

  // Filtros de fecha
  startDate: string | null = null;
  endDate: string = new Date().toISOString().split('T')[0];
  currentPage = 1;
  totalPages = 1;

  totalVentas: number = 0;
  totalKilos: number = 0;
  totalUnidades: number = 0;

  constructor(private metricsService: MetricsService) {
    addIcons({
      'refresh-outline': refreshOutline,
    });
  }

  ngOnInit() {
    this.loadMetrics();
  }

  loadMetrics(
    startDate?: string,
    endDate?: string,
    isPageChange: boolean = false
  ) {
    if (!isPageChange) {
      this.isLoading = true;
    }
    this.isTableLoading = true;
    this.error = null;

    console.log('startDate', this.startDate);
    console.log('endDate', this.endDate);

    this.metricsService
      .getMetrics(startDate, endDate)
      .pipe(
        finalize(() => {
          if (!isPageChange) {
            this.isLoading = false;
          }
          this.isTableLoading = false;
        })
      )
      .subscribe({
        next: (response) => {
          this.metrics = response;
          this.updateTotals();
          this.calculateTotals();
        },
        error: (err) => {
          this.error =
            'Error al cargar las métricas. Por favor, intenta de nuevo más tarde.';
          console.error('Error loading metrics:', err);
        },
      });
  }

  updateTotals() {
    if (this.metrics) {
      this.totalVentas = this.metrics.total_sold;
      this.metrics.quantity_by_unit.forEach((item) => {
        if (item.unity === 'Kg') {
          this.totalKilos = item.total;
        } else if (item.unity === 'un') {
          this.totalUnidades = item.total;
        }
      });
    }
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
    }).format(value);
  }

  formatQuantity(product: MetricProduct): string {
    return `${product.total_quantity} ${product.type_of_unit_measurement}`;
  }

  refresh() {
    this.loadMetrics();
  }

  nextPage() {
    if (this.metrics?.next) {
      this.currentPage++;
      this.isTableLoading = true;
      this.metricsService
        .getMetricsByUrl(this.metrics.next)
        .pipe(
          finalize(() => {
            this.isTableLoading = false;
          })
        )
        .subscribe({
          next: (response) => {
            this.metrics = response;
            this.updateTotals();
            this.calculateTotals();
          },
          error: (err) => {
            this.error =
              'Error al cargar las métricas. Por favor, intenta de nuevo más tarde.';
            console.error('Error loading metrics:', err);
          },
        });
    }
  }

  previousPage() {
    if (this.metrics?.previous) {
      this.currentPage--;
      this.isTableLoading = true;
      this.metricsService
        .getMetricsByUrl(this.metrics.previous)
        .pipe(
          finalize(() => {
            this.isTableLoading = false;
          })
        )
        .subscribe({
          next: (response) => {
            this.metrics = response;
            this.updateTotals();
            this.calculateTotals();
          },
          error: (err) => {
            this.error =
              'Error al cargar las métricas. Por favor, intenta de nuevo más tarde.';
            console.error('Error loading metrics:', err);
          },
        });
    }
  }

  applyDateFilter() {
    this.loadMetrics();
  }

  clearDateFilter() {
    this.startDate = null;
    this.endDate = new Date().toISOString().split('T')[0];
    this.loadMetrics();
  }

  calculateTotals() {
    if (this.metrics) {
      this.totalPages = Math.ceil((this.metrics.count || 0) / 10);
    }
  }
}
