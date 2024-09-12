import { Component, OnInit } from '@angular/core';
import { InventoryService } from '../../../../../core/services/inventory.service';
import { Router } from '@angular/router';
import { AlertsService } from '../../../../../core/services/alerts.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class ListComponent  implements OnInit {
  public showDeleteAlert:boolean = false;
  public isLoading:boolean = false;
  public limit:number = 10;
  public offset:number = 0;
  public search:string = '';
  public totalItems:number = 0;
  currentPage = 1;
  totalPages = 1;
  pageNumbers: number[] = [];
  Products: any[] = [];
  selectedProduct:any;
  constructor(private inventorySvc:InventoryService, private router:Router, private alertSvc:AlertsService) { }

  ngOnInit() {
    this.getProducts();
  }


  getProducts(){
      this.inventorySvc.getProducts(this.limit, this.offset)
          .subscribe({
            error:(err:any) => {
              console.log(err);
            },
            next:(resp:any) => {
              console.log(resp);
              this.Products = resp.results;
              this.totalItems = resp.count;
              this.totalPages = Math.ceil(this.totalItems / this.limit);
              this.isLoading = !this.isLoading;
              this.updatePageNumbers();
            }
          })
  };

  updatePageNumbers(): void {
    this.pageNumbers = Array.from({ length: this.totalPages }, (_, i) => i + 1);
  };

  goToPage(page: number): void {
    this.currentPage = page;
    this.offset = (page - 1) * this.limit;
    this.getProducts();
  };

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.offset += this.limit;
      this.getProducts();
    }
  };

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.offset -= this.limit;
      this.getProducts();
    }
  };

  onDelete(id:any){
    this.selectedProduct = id;
    this.showDeleteAlert = !this.showDeleteAlert;
  };

  delete(event:boolean){
    if (event) {
      this.deleteProduct()
    } else {
      this.alertSvc.presentAlert('Éxito', 'No eliminamos el producto')
    }
  };

  goToUpdate(p:any){
    sessionStorage.setItem('product', JSON.stringify(p) );
    this.router.navigateByUrl(`/home/inventory/products/update/${p?.id}`);
  };

  deleteProduct(){
    this.isLoading = !this.isLoading;
    this.inventorySvc.deleteProduct(this.selectedProduct)
    .subscribe({
      error:(err:any) => {
        this.alertSvc.presentAlert('Ooops',err.error.message)
        this.showDeleteAlert = !this.showDeleteAlert;
        this.isLoading = !this.isLoading;
      },
      next:(resp:any) => {
        this.getProducts();
        this.showDeleteAlert = !this.showDeleteAlert;
        this.alertSvc.presentAlert('Éxito','Producto eliminado');
        this.isLoading = !this.isLoading;
      }
        })
  }


}
