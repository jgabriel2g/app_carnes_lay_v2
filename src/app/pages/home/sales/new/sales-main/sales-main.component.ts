import { Component, HostListener, OnInit } from '@angular/core';
import { SalesService } from '../../../../../core/services/sales.service';
import { Router } from '@angular/router';
import { AlertsService } from '../../../../../core/services/alerts.service';
import { AuthService } from '../../../../../core/services/auth.service';
import {AlertController} from "@ionic/angular";
import {OtpService} from "../../../../../core/services/otp.service";

@Component({
  selector: 'app-sales-main',
  templateUrl: './sales-main.component.html',
  styleUrls: ['./sales-main.component.scss'],
})
export class SalesMainComponent  implements OnInit {
  public windowWith:any;
  public isColapsed:boolean = false
  public boxInfo:any;
  maxAttempts = 3;
  attempts = 0;
  otpCode: string = ''

  constructor(
    public authSvc:AuthService,
    private alertSvc:AlertsService,
    private salesSvc:SalesService,
    private alertController:AlertController,
    private router:Router,
    private otpService: OtpService
  ) {
    this.checkScreenWidth();
  }

  ngOnInit() {
      this.checkScreenWidth();
      setTimeout(() => this.checkScreenWidth(), 0);
      this.getBoxSalesById();
  };

  getBoxSalesById(){
    this.boxInfo = JSON.parse(sessionStorage.getItem('saleBoxInfo') || '')
    this.salesSvc.getBoxSaleById(this.boxInfo.id)
          .subscribe({
            error:(err:any) => {
              console.log(err)
            },
            next:(resp:any) => {
              this.boxInfo = resp;
            }
          });
  };

  async closeBox() {
    this.otpService
      .verifyOtpAndExecute(() => {
        this.salesSvc.closeBoxSale(this.boxInfo.id)
          .subscribe({
            error:(err:any) => {
              console.log(err);
            },
            next:(resp:any) => {
              this.router.navigateByUrl('/home/sales/new/').then();
              sessionStorage.removeItem('saleBoxInfo');
            }
          });
      }, 'eliminar producto')
      .then();
  }

  requestOtp(phone: string) {
    this.authSvc.validateWithOtp(phone).subscribe(
      async (response: any) => {
        this.otpCode = response.otp;
        this.maxAttempts = response.max_attempts;
        await this.enterOtp(phone);
      },
      async (error) => {
        await this.showAlert('Error', 'No se pudo enviar el OTP. Inténtalo nuevamente.');
      }
    );
  }

  async enterOtp(phone: string) {
    if (this.attempts >= this.maxAttempts) {
      await this.showAlert('Error', 'Has alcanzado el número máximo de intentos.');
      return;
    }

    const otpPrompt = await this.alertController.create({
      header: 'Código OTP',
      message: 'Por favor, ingresa el código OTP enviado.',
      inputs: [
        {
          name: 'otp',
          type: 'number',
          placeholder: 'Código OTP',
        },
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Verificar',
          handler: async (data) => {
            if (data.otp) {
              await this.verifyOtp(data.otp);
            } else {
              await this.showAlert('Error', 'Debes ingresar el código OTP.');
            }
          },
        },
      ],
    });
    await otpPrompt.present();
  }

  async verifyOtp(otpInput: string) {
    if (otpInput === this.otpCode) {
      await this.showAlert('Éxito', 'Caja cerrada exitosamente.');
      this.attempts = 0;
      this.otpCode = '';
      this.salesSvc.closeBoxSale(this.boxInfo.id)
        .subscribe({
          error:(err:any) => {
            console.log(err);
          },
          next:(resp:any) => {
            // const result = resp;
            // result.isMobile = false;
            // this.router.navigateByUrl('/daily-ticket', { state: { sale: result } }).then();
            this.router.navigateByUrl('/home/sales/new/').then();
            sessionStorage.removeItem('saleBoxInfo');
          }
        });
    } else {
      this.attempts++;
      if (this.attempts < this.maxAttempts) {
        await this.showAlert('Error', 'Código OTP incorrecto. Inténtalo nuevamente.');
        this.enterOtp('').then()
      } else {
        await this.showAlert('Error', 'Has alcanzado el número máximo de intentos.');
      }
    }
  }

  async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK'],
    });
    await alert.present();
  }

  checkScreenWidth() {
    this.windowWith = window.innerWidth;
  };

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenWidth();
  };

  reloadBoxInfo(event:any) {
    this.getBoxSalesById();
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
