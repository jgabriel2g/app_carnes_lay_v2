import { Component, OnInit } from '@angular/core';
import { ThirdPartyService } from '../../../../core/services/third-party.service';
import { Router } from '@angular/router';
import { AlertsService } from '../../../../core/services/alerts.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class ListComponent  implements OnInit {
  public isLoading:boolean = false;
  public Providers:any[]  = [];
  public limit:number = 10;
  public offset:number = 0;
  public search:string = '';
  public totalItems:number = 0;
  currentPage = 1;
  totalPages = 1;
  pageNumbers: number[] = [];
  constructor(private thirdPartySvc:ThirdPartyService, private router:Router, private alertSvc:AlertsService) { }

  ngOnInit() {
    this.getProviders();
  }

  getProviders(){
    this.isLoading = !this.isLoading;
    this.thirdPartySvc.getProviders(this.limit, this.offset)
      .subscribe({
        error:(err:any) => {
          console.log(err);
          this.isLoading = !this.isLoading;
        },
        next:(resp:any) => {
          console.log(resp)
          this.Providers = resp.results;
          this.totalItems = resp.count;
          this.totalPages = Math.ceil(this.totalItems / this.limit);
          this.isLoading = !this.isLoading;
          this.updatePageNumbers();
        }
      });
  };

  goToUpdate(data:any){
    sessionStorage.setItem('provider', JSON.stringify(data));
    this.router.navigateByUrl(`/home/providers/update/${data?.id}`)
  };

  deleteProvider(id:any){
    this.isLoading = !this.isLoading;
    this.thirdPartySvc.deleteProvider(id)
      .subscribe({
        error:(err:any) => {
          this.alertSvc.presentAlert('Ooops',err.error.message)
          this.isLoading = !this.isLoading;
        },
        next:(resp:any) => {
          this.getProviders();
          this.alertSvc.presentAlert('Éxito','Proveedor eliminado');
          this.isLoading = !this.isLoading;
        }
      });
  }

  updatePageNumbers(): void {
    this.pageNumbers = Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  goToPage(page: number): void {
    this.currentPage = page;
    this.offset = (page - 1) * this.limit;
    this.getProviders();
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.offset += this.limit;
      this.getProviders();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.offset -= this.limit;
      this.getProviders();
    }
  }

}
