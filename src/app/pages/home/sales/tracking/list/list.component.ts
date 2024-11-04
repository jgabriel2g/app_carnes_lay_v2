import { Component, OnInit } from '@angular/core';
import { SalesService } from '../../../../../core/services/sales.service';
import { AlertsService } from '../../../../../core/services/alerts.service';
import { AlertController } from '@ionic/angular';
import { AuthService } from '../../../../../core/services/auth.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class ListComponent  implements OnInit {

  public limit:number = 10;
  public offset:number = 0;
  public search:string = '';
  public saleId:string = '';
  public totalItems:number = 0;
  public currentPage = 1;
  public totalPages = 1;
  public pageNumbers: number[] = [];
  public Sales:any[] = [];
  public isLoading:boolean = false;
  public showDetailBills:boolean = false;
  constructor(public authSvc:AuthService, private salesSvc:SalesService, private alertSvc:AlertsService, private alertController: AlertController) { }

  ngOnInit() {
    this.getSales();
  };

  getSales(){
    this.salesSvc.getSales(this.limit, this.offset)
        .subscribe({
          error:(err:any) => {
            console.log(err)
          },
          next:(resp:any) => {
            this.Sales = resp.results;
            this.totalItems = resp.count;
            this.totalPages = Math.ceil(this.totalItems / this.limit);
            this.isLoading = !this.isLoading;
            this.updatePageNumbers();
          }
        });
  };


  deleteSale(id:any){
      this.salesSvc.deleteSale(id)
          .subscribe({
            error:(err:any) =>{
              console.log(err);
              this.handleError(err);
            },
            next:(resp:any) => {
              this.alertSvc.presentAlert('Éxito', 'Venta eliminada');
              this.getSales()
            }
          });
  };

  updatePageNumbers(): void {
    this.pageNumbers = Array.from({ length: this.totalPages }, (_, i) => i + 1);
  };



  goToPage(page: number): void {
    this.currentPage = page;
    this.offset = (page - 1) * this.limit;
    this.getSales();
  };

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.offset += this.limit;
      this.getSales();
    };
  };

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.offset -= this.limit;
      this.getSales();
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
    }
  };

  showSalesDetail(data:string){
    this.saleId = data;
    this.showDetailBills = !this.showDetailBills;
  };

  closeDetailModal(event:boolean){
    this.showDetailBills = false;
    this.getSales();
  }


}
