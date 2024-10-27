import { Component, OnInit } from '@angular/core';
import { MarketRatesService } from '../../../../../core/services/market-rates.service';
import { AuthService } from '../../../../../core/services/auth.service';
import Swal from 'sweetalert2';
import { AlertsService } from '../../../../../core/services/alerts.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class ListComponent  implements OnInit {
  public limit:number = 15;
  public offset:number = 0;
  public totalItems:number = 0;
  public MarketRates:any[] = [];
  public currentPage = 1;
  public totalPages = 1;
  public pageNumbers: number[] = [];
  constructor(private marketRateSvc:MarketRatesService, public authSvc:AuthService, private alertSvc:AlertsService) { }

  ngOnInit() {
    this.getMarketRates();
    this.updatePageNumbers();
  }

  getMarketRates(){
    this.marketRateSvc.getMarketRates(this.limit, this.offset)
        .subscribe({
          error:(err:any) => {
            console.log(err);
          },
          next:(resp:any) => {
            console.log(resp);
            this.totalItems = resp.count;
            this.MarketRates = resp.results;
            this.totalPages = Math.ceil(this.totalItems / this.limit);
          }
        });
  };

  deleteMarketRate(id:string){
    this.marketRateSvc.deleteMarketRate(id)
        .subscribe({
          error:(err:any) => {
            this.handleError(err);
          },
          next:(resp:any) => {
            this.getMarketRates();
          }
        })
  }

  updatePageNumbers(): void {
    this.pageNumbers = Array.from({ length: this.totalPages }, (_, i) => i + 1);
  };

  goToPage(page: number): void {
    this.currentPage = page;
    this.offset = (page - 1) * this.limit;
    this.getMarketRates();
  };

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.offset += this.limit;
      this.getMarketRates();
    };
  };

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.offset -= this.limit;
      this.getMarketRates();
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

}
