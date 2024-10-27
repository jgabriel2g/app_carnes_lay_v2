import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { SalesService } from '../../../../../core/services/sales.service';
import { AlertsService } from '../../../../../core/services/alerts.service';
import { ThirdPartyService } from '../../../../../core/services/third-party.service';

@Component({
  selector: 'app-sale-bills',
  templateUrl: './sale-bills.component.html',
  styleUrls: ['./sale-bills.component.scss'],
})
export class SaleBillsComponent  implements OnInit {
  @Input() sale: string = '';
  bills:any[]=[]
  @Output() close = new EventEmitter<boolean>();
  public limit:number = 10;
  public offset:number = 0;

  public totalItems:number = 0;
  public currentPage = 1;
  public totalPages = 1;
  public pageNumbers: number[] = [];
  public Clients: number[] = [];
  public clientSelected:string = '';
  public isLoading:boolean = false;
  constructor(private alertController: AlertController,private clientSvc:ThirdPartyService , private alertSvc:AlertsService, private salesSvc:SalesService) { }

  ngOnInit() {
    this.getSales();
  }

  async showBillDetail(products:any) {
    const messageContent = products.map((p:any) =>
      `Producto: ${p.product.product.name}, Cantidad: ${p.amount}, Costo: ${p.product.price}`).join('<br>');

    const alert = await this.alertController.create({
      header: 'Detalle de compra',
      message: messageContent,
      buttons: ['OK']
    });

    await alert.present();
  };

  deleSale(id:any){
    this.salesSvc.deleteBillSale(id)
        .subscribe({
          error:(err:any) =>{
            console.log(err);
            this.handleError(err);
          },
          next:(resp:any) => {
            this.alertSvc.presentAlert('Éxito', 'Factura eliminada');
            this.closeModal()
          }
        });
  }


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

  closeModal(){
    this.close.emit(true);
  };


  getSales(){
    this.isLoading = !this.isLoading;
    this.salesSvc.getBillsBySale(this.limit, this.offset, this.sale, this.clientSelected)
        .subscribe({
          error:(err:any) => {
            console.log(err)
            this.isLoading = !this.isLoading;
          },
          next:(resp:any) => {
            console.log(resp)
            this.bills = resp.results;
            this.totalItems = resp.count;
            this.totalPages = Math.ceil(this.totalItems / this.limit);
            this.updatePageNumbers();
            this.isLoading = !this.isLoading;
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




}
