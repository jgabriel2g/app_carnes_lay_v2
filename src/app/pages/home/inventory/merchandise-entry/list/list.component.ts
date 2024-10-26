import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { InventoryService } from '../../../../../core/services/inventory.service';
import { AlertsService } from '../../../../../core/services/alerts.service';
import { AlertController } from '@ionic/angular';
import { AuthService } from '../../../../../core/services/auth.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss'],
})
export class ListComponent  implements OnInit {
  public openNewMerchEntryModal:boolean = false;
  public limit:number = 10;
  public offset:number = 0;
  public search:string = '';
  public totalItems:number = 0;
  public currentPage = 1;
  public totalPages = 1;
  public pageNumbers: number[] = [];
  public Purchases: any[] = [];
  public isLoading:boolean = false;
  public rejectionReason:string = '';
  public updateData:any;

  constructor(
    public authSvc:AuthService,
    private router:Router,
    private inventorySvc:InventoryService,
    private alertSvc:AlertsService,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.getPurchaseStocks()
  }

  getPurchaseStocks(){
    this.isLoading = !this.isLoading;
    this.inventorySvc.getPurchases(this.limit, this.offset)
          .subscribe({
            error:(err:any) => {
              console.log(err);
            },
            next:(resp:any) => {
              console.log("resp")
              console.log(resp);
              this.Purchases = resp.results;
              this.totalItems = resp.count;
              this.totalPages = Math.ceil(this.totalItems / this.limit);
              this.isLoading = !this.isLoading;
              this.updatePageNumbers();
            }
          });
  };

  openNewMerchEntry(event:any) {
    if (event.value) {
      this.inventorySvc.purchaseStockDetail({provider:Number(event.providerId)})
        .subscribe({
          error:(err:any) =>{
            this.handleError(err);
          },
          next:(resp:any) => {
            console.log(resp)
            this.router.navigateByUrl('/home/inventory/merchandiseEntry/create/' + resp.id).then()
             this.openNewMerchEntryModal = false;
          }
        })
      } else {
        this.openNewMerchEntryModal = false;
     }
  };

  updatePageNumbers(): void {
    this.pageNumbers = Array.from({ length: this.totalPages }, (_, i) => i + 1);
  };

  goToPage(page: number): void {
    this.currentPage = page;
    this.offset = (page - 1) * this.limit;
    this.getPurchaseStocks();
  };

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.offset += this.limit;
      this.getPurchaseStocks();
    }
  };

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.offset -= this.limit;
      this.getPurchaseStocks();
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

  updatePurchaseStatus(providerId:any, status:any, purchaseId:any){
    this.isLoading = !this.isLoading;

    if (this.rejectionReason == null) {
      this.updateData = {
        "provider": providerId,
        "status": status,
      }
      if (status === 4) {
        this.updateData["is_approved"] = true;
      }
    } else {
      this.updateData = {
        "provider": providerId,
        "status":status ,
        "reason": this.rejectionReason
      };
    }

    this.inventorySvc.updatePurchase(this.updateData, purchaseId)
      .subscribe({
        error:(err:any) => {
          console.log(err);
          this.handleError(err);
          this.isLoading = !this.isLoading;
        },
        next:(resp:any) =>{
          this.isLoading = !this.isLoading;
          this.alertSvc.presentAlert('Éxito', 'Cargue de mercancía actualizado');
          if (status === 3) {
            this.router.navigateByUrl('/home/inventory/merchandiseEntry/create/' + purchaseId).then()
          } else {
            this.getPurchaseStocks();
          }
        }
      });
  };

  async rejectRequest(providerId:any, purchaseId:any) {
    console.log('Presentando alerta'); // Verifica si llega hasta aquí

    const alert = await this.alertController.create({
      header: 'Rechazar solicitud',
      message: 'Por favor, ingresa la razón del rechazo:',
      inputs: [
        {
          name: 'reason',
          type: 'textarea',
          placeholder: 'Razón del rechazo',
        },
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          handler: () => {
            console.log('Rechazo cancelado');
          },
        },
        {
          text: 'Confirmar',
          handler: (data) => {
            this.rejectionReason = data.reason;
            this.updatePurchaseStatus(providerId, 5, purchaseId)
          },
        },
      ],
    });

    await alert.present();
  }

  reasonAlert(alert:string){
    this.alertSvc.presentAlert('Cargue de mercancía rechazado', `Razón: ${alert}`).then();
  };
}
