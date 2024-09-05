import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../../core/services/auth.service';
import { AlertsService } from '../../../../core/services/alerts.service';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.scss'],
})
export class ChangePasswordComponent  implements OnInit {
  passwordForm: FormGroup;


  constructor(private fb: FormBuilder, private authSvc:AuthService, private alertSvc:AlertsService) {
    this.passwordForm = this.fb.group({
      new_password1: ['', Validators.required],
      new_password2: ['', Validators.required]
    });
   }

  ngOnInit() {}


  onSubmit() {
    this.passwordForm.markAllAsTouched();
    if (this.passwordForm.valid) {
     this.changePassword();
    } else {
      this.alertSvc.presentAlert('Ooops', 'Revisa los campos');

    }
  };

  changePassword(){
    this.authSvc.changePassword(this.passwordForm.value)
        .subscribe({
          error:(err:any) =>{
            console.log(err);
           this.handleError(err);
          },
          next:(resp:any) => {
            this.alertSvc.presentAlert('Éxito', 'Contraseña actualizada');
          }
        });
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
  }
}
