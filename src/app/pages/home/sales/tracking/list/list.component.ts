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
  public totalItems:number = 0;
  currentPage = 1;
  totalPages = 1;
  pageNumbers: number[] = [];
  Bills:any[] = [];
  public isLoading:boolean = false;
  constructor(public authSvc:AuthService, private salesSvc:SalesService, private alertSvc:AlertsService, private alertController: AlertController) { }

  ngOnInit() {
    this.getBill();
  }



  getBill(){
    this.isLoading = !this.isLoading;
    this.salesSvc.getBills(this.limit, this.offset)
      .subscribe({
        error:(err:any) => {
          this.handleError(err);
          this.isLoading = !this.isLoading;
        },
        next:(resp:any) => {
          this.Bills = resp.results;
          this.totalItems = resp.count;
          this.totalPages = Math.ceil(this.totalItems / this.limit);
          this.isLoading = !this.isLoading;
          this.updatePageNumbers();
        }
      });
  };

  deleteBill(id:any){
      this.salesSvc.deleteBillSale(id)
          .subscribe({
            error:(err:any) =>{
              console.log(err);
              this.handleError(err);
            },
            next:(resp:any) => {
              this.getBill()
              this.alertSvc.presentAlert('Éxito', 'Factura eliminada');
            }
          });
  };


  updatePageNumbers(): void {
    this.pageNumbers = Array.from({ length: this.totalPages }, (_, i) => i + 1);
  };



  goToPage(page: number): void {
    this.currentPage = page;
    this.offset = (page - 1) * this.limit;
    this.getBill();
  };

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.offset += this.limit;
      this.getBill();
    };
  };

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.offset -= this.limit;
      this.getBill();
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

  // Función para mostrar la alerta
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

}
