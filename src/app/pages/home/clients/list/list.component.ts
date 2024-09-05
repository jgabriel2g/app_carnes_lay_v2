import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertsService } from 'src/app/core/services/alerts.service';
import { ThirdPartyService } from 'src/app/core/services/third-party.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class ListComponent  implements OnInit {

  public isLoading:boolean = false;
  public Clients:any[]  = [];
  public limit:number = 10;
  public offset:number = 0;
  public search:string = '';
  public totalItems:number = 0;
  currentPage = 1;
  totalPages = 1;
  pageNumbers: number[] = [];
  constructor(private thirdPartySvc:ThirdPartyService, private router:Router, private alertSvc:AlertsService) { }

  ngOnInit() {
    this.getClients();
  }

  getClients(){
    this.isLoading = !this.isLoading;
    this.thirdPartySvc.getClients(this.limit, this.offset)
      .subscribe({
        error:(err:any) => {
          console.log(err);
          this.isLoading = !this.isLoading;
        },
        next:(resp:any) => {
          console.log(resp)
          this.Clients = resp.results;
          this.totalItems = resp.count;
          this.totalPages = Math.ceil(this.totalItems / this.limit);
          this.isLoading = !this.isLoading;
          this.updatePageNumbers();
        }
      });
  };

  goToUpdate(data:any){
    sessionStorage.setItem('client', JSON.stringify(data));
    this.router.navigateByUrl(`/home/clients/update/${data?.id}`)
  };

  deleteClient(id:any){
    this.isLoading = !this.isLoading;
    this.thirdPartySvc.deleteClient(id)
      .subscribe({
        error:(err:any) => {
          this.alertSvc.presentAlert('Ooops',err.error.message)
          this.isLoading = !this.isLoading;
        },
        next:(resp:any) => {
          this.getClients();
          this.alertSvc.presentAlert('Éxito','Cliente eliminado');
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
    this.getClients();
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.offset += this.limit;
      this.getClients();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.offset -= this.limit;
      this.getClients();
    }
  }

}
