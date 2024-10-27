import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PayRollService } from '../../../../core/services/pay-roll.service';
import { AlertsService } from '../../../../core/services/alerts.service';
import { AuthService } from 'src/app/core/services/auth.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class ListComponent  implements OnInit {
  public limit:number = 15;
  public offset:number = 0;
  public totalItems:number = 0;
  public Employees:any[]= [];
  public currentPage = 1;
  public totalPages = 1;
  public pageNumbers: number[] = [];
  constructor(public authSvc:AuthService,private router:Router, private payrollSvc:PayRollService, private alertSvc:AlertsService) { }

  ngOnInit() {
    this.getEmployees();
  }

  getEmployees(){
    this.payrollSvc.getPayroll(this.limit, this.offset)
        .subscribe({
          error:(err:any) => {
            console.log(err);
            this.handleError(err);
          },
          next:(resp:any) => {
            console.log(resp);
            this.totalItems = resp.count;
            this.Employees = resp.results;
            this.totalPages = Math.ceil(this.totalItems / this.limit);
            this.updatePageNumbers();
          }
        });
  };

  onDelete(id:any) {
    Swal.fire({
      title: "¿Estas seguro de los cambios a realizar",
      text: "No podras revertir los cambios",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      cancelButtonText:'Cancelar',
      confirmButtonText: "Si, Eliminar"
    }).then((result:any) => {
      if (result.isConfirmed) {
        this.deleteEmployee(id)
      }
    });
  }

  deleteEmployee(id:string){
    this.payrollSvc.deletePayroll(id)
        .subscribe({
          error:(err:any) => {
            this.handleError(err);
          },
          next:(resp:any) => {
            console.log(resp);
            this.getEmployees();
          }
        });
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

  goToUpdate(data:any){
    sessionStorage.setItem('employee', JSON.stringify(data));
    this.router.navigateByUrl(`/home/pay-roll/update/${data?.id}`)
  };

  updatePageNumbers(): void {
    this.pageNumbers = Array.from({ length: this.totalPages }, (_, i) => i + 1);
  };

  goToPage(page: number): void {
    this.currentPage = page;
    this.offset = (page - 1) * this.limit;
    this.getEmployees();
  };

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.offset += this.limit;
      this.getEmployees();
    };
  };

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.offset -= this.limit;
      this.getEmployees();
    };
  };

}
