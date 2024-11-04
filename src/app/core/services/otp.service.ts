import { Injectable } from '@angular/core';
import { AlertController } from '@ionic/angular';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class OtpService {
  private otpCode: string = '';
  private maxAttempts = 3;
  private attempts = 0;

  constructor(
    private alertController: AlertController,
    private authSvc: AuthService
  ) {}

  async verifyOtpAndExecute(action: () => void) {
    this.attempts = 0;
    const phonePrompt = await this.alertController.create({
      header: 'Cerrar Caja',
      message: 'Por favor, ingresa el número de teléfono del administrador.',
      inputs: [
        {
          name: 'phone',
          type: 'tel',
          placeholder: 'Número de teléfono',
        },
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Enviar',
          handler: async (data) => {
            if (data.phone) {
              this.requestOtp(data.phone, action);
            } else {
              await this.showAlert('Error', 'Debes ingresar un número de teléfono.');
            }
          },
        },
      ],
    });
    await phonePrompt.present();
  }

  private requestOtp(phone: string, action: () => void) {
    this.authSvc.validateWithOtp(phone).subscribe(
      async (response: any) => {
        this.otpCode = response.otp;
        this.maxAttempts = response.max_attempts;
        await this.enterOtp(phone, action);
      },
      async (error) => {
        await this.showAlert('Error', 'No se pudo enviar el OTP. Inténtalo nuevamente.');
      }
    );
  }

  private async enterOtp(phone: string, action: () => void) {
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
              await this.verifyOtp(data.otp, action);
            } else {
              await this.showAlert('Error', 'Debes ingresar el código OTP.');
            }
          },
        },
      ],
    });
    await otpPrompt.present();
  }

  private async verifyOtp(otpInput: string, action: () => void) {
    if (otpInput === this.otpCode) {
      await this.showAlert('Éxito', 'OTP validado exitosamente.');
      this.attempts = 0;
      this.otpCode = '';
      action();
    } else {
      this.attempts++;
      if (this.attempts < this.maxAttempts) {
        await this.showAlert('Error', 'Código OTP incorrecto. Inténtalo nuevamente.');
        this.enterOtp('', action).then();
      } else {
        await this.showAlert('Error', 'Has alcanzado el número máximo de intentos.');
      }
    }
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
