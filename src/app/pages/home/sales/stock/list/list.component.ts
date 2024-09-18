import { Component, OnInit } from '@angular/core';
import { SalesService } from '../../../../../core/services/sales.service';
import { Router } from '@angular/router';
import { AlertsService } from '../../../../../core/services/alerts.service';
import { AuthService } from '../../../../../core/services/auth.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class ListComponent  implements OnInit {
  public loadMoreStock:boolean = false;
  public limit:number = 10;
  public offset:number = 0;
  public search:string = '';
  public totalItems:number = 0;
  currentPage = 1;
  totalPages = 1;
  pageNumbers: number[] = [];
  displayStocks:any[] = [];
  public isLoading:boolean = false;
  public displayId:any
  constructor(public authSvc:AuthService, private salesSvc:SalesService, private router:Router, private alertSvc:AlertsService) { }

  ngOnInit() {
    this.getDisplayStock();
  }

  closeLoadStockDialog( displayId?:any){
    if (displayId == false) {
      this.loadMoreStock = !this.loadMoreStock;
      this.getDisplayStock();
    } else {
      this.loadMoreStock = !this.loadMoreStock;
      this.displayId =displayId
    };
  };


  getDisplayStock(){
    this.isLoading = !this.isLoading;
    this.salesSvc.getDisplayStock(this.limit, this.offset)
      .subscribe({
        error:(err:any) => {
          this.handleError(err);
          this.isLoading = !this.isLoading;
        },
        next:(resp:any) => {
          this.displayStocks = resp.results;
          this.totalItems = resp.count;
          this.totalPages = Math.ceil(this.totalItems / this.limit);
          this.isLoading = !this.isLoading;
          this.updatePageNumbers();
        }
      });
  }
  updatePageNumbers(): void {
    this.pageNumbers = Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.offset = (page - 1) * this.limit;
    this.getDisplayStock();
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.offset += this.limit;
      this.getDisplayStock();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.offset -= this.limit;
      this.getDisplayStock();
    };
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
    }
  };

}
