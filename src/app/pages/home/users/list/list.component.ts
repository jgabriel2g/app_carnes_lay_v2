import { Component, OnInit } from '@angular/core';
import { UsersService } from '../../../../core/services/users.service';
import { AlertsService } from '../../../../core/services/alerts.service';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class ListComponent  implements OnInit {
  public isLoading:boolean = false;
  public Users:any[] = [];
  public limit:number = 10;
  public offset:number = 0;
  public search:string = '';
  public totalItems:number = 0;
  public currentPage = 1;
  public totalPages = 1;
  public pageNumbers: number[] = [];
  constructor(public authSvc:AuthService, private usersSvc:UsersService, private alertSvc:AlertsService, private router:Router) { }


  ngOnInit() {
    sessionStorage.removeItem('user');
    this.getUsers();
  }


  getUsers(){
    this.isLoading = !this.isLoading
    const data ={
      offset: this.offset,
      limit: this.limit,
      search: this.search
    };

    this.usersSvc.getUsers(data)
        .subscribe({
          error:(err:any) => {
            this.isLoading = !this.isLoading
          },
          next:(resp:any) => {
            this.Users = resp.results;
            this.totalItems = resp.count;
            this.totalPages = Math.ceil(this.totalItems / this.limit);
            this.isLoading = !this.isLoading;
            this.updatePageNumbers();
            this.isLoading = !this.isLoading
          }
        });
  };

  goToUpdate(data:any){
    sessionStorage.setItem('user', JSON.stringify(data));
    this.router.navigateByUrl(`/home/users/update/${data?.id}`)
  };

  updatePageNumbers(): void {
    this.pageNumbers = Array.from({ length: this.totalPages }, (_, i) => i + 1);
  };

  goToPage(page: number): void {
    this.currentPage = page;
    this.offset = (page - 1) * this.limit;
    this.getUsers();
  };

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.offset += this.limit;
      this.getUsers();
    };
  };

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.offset -= this.limit;
      this.getUsers();
    };
  };
}
