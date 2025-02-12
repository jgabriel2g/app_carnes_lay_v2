import { Component, OnInit } from '@angular/core';
import { SalesService } from '../../../../../core/services/sales.service';
import { Router } from '@angular/router';
import { AlertsService } from '../../../../../core/services/alerts.service';
import { AuthService } from '../../../../../core/services/auth.service';
import {DisplayStock} from "../../../../../core/models/displayStock";
import {PaginatedResponse} from "../../../../../core/models/global.model";
import {ProductStock} from "../../../../../core/models/sale.model";

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class ListComponent  implements OnInit {
  public loadMoreStock:boolean = false;
  public limit:number = 15;
  public offset:number = 0;
  public search:string = '';
  public totalItems:number = 0;
  public currentPage = 1;
  public totalPages = 1;
  public pageNumbers: number[] = [];
  public displayStocks: ProductStock[] = [];
  public isLoading:boolean = false;
  public displayId:any

  constructor(public authSvc:AuthService, private salesSvc:SalesService, private router:Router, private alertSvc:AlertsService) { }

  ngOnInit() {
    this.getDisplayStock();
  }

  closeLoadStockDialog(displayId?:any){
    if (displayId == false) {
      this.loadMoreStock = !this.loadMoreStock;
      this.displayId = null;
    } else {
      this.loadMoreStock = !this.loadMoreStock;
      this.displayId = displayId
    }
    this.getDisplayStock();
  };


  getDisplayStock(){
    this.isLoading = !this.isLoading;
    this.salesSvc.getDisplayStock(this.limit, this.offset, this.search)
      .subscribe({
        error:(err:any) => {
          this.handleError(err);
          this.isLoading = !this.isLoading;
        },
        next:(resp:PaginatedResponse<ProductStock>) => {
          this.displayStocks = resp.results;
          this.totalItems = resp.count;
          this.totalPages = Math.ceil(this.totalItems / this.limit);
          this.isLoading = !this.isLoading;
          this.updatePageNumbers();
        }
      });
  };

  updatePageNumbers(): void {
    this.pageNumbers = Array.from({ length: this.totalPages }, (_, i) => i + 1);
  };

  goToPage(page: number): void {
    this.currentPage = page;
    this.offset = (page - 1) * this.limit;
    this.getDisplayStock();
  };

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.offset += this.limit;
      this.getDisplayStock();
    };
  };

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.offset -= this.limit;
      this.getDisplayStock();
    };
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

  downloadInventory() {
    this.salesSvc.getReportDisplayStock().subscribe({
      next: (response: Blob) => {
        const url = window.URL.createObjectURL(response);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'inventario_vitrina.pdf';
        a.click();
        window.URL.revokeObjectURL(url);
      },
      error: (err) => {
        this.handleError(err);
      },
    });
  }

}
