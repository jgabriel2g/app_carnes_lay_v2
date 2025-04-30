import { Injectable } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class OtpService {

  constructor(
    private alertController: AlertController,
    private authSvc: AuthService
  ) {}

  async verifyOtpAndExecute(action: () => void, title: string = 'Cerrar Caja') {
    const phonePrompt = await this.alertController.create({
      header: title,
      message: 'Accion valida solo para administradores. Ingresa tu numero de telefono y tu clave dinamica.',
      inputs: [
        {
          name: 'admin_phone_number',
          type: 'tel',
          placeholder: 'Número de telefono',
        },
        {
          name: 'otp',
          type: 'number',
          placeholder: 'Clave dinamica',
        },
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Enviar',
          handler: async (data: {otp: string, admin_phone_number: string}) => {
            if (data.admin_phone_number && data.otp) {
              this.requestOtp(data.admin_phone_number, data.otp, action);
            } else {
              await this.showAlert('Error', 'Completa todos los campos.');
            }
          },
        },
      ],
    });
    await phonePrompt.present();
  }

  private requestOtp(admin_phone_number: string, otp: string, action: () => void) {
    this.authSvc.validateTOTPCode(otp, admin_phone_number).subscribe(
      async (response: any) => {
        console.log('🔄 OTP valido');
        console.log(response);
        action();
      },
      async (error) => {
        await this.showAlert('Error', error.error["error"]);
      }
    );
  }

  private async showAlert(header: string, message: string) {
    const alert = await this.alertController.create({
      header,
      message,
      buttons: ['OK'],
    });
    await alert.present();
  }
}
