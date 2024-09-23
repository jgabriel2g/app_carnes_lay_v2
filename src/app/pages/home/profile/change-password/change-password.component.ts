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
    };
  };

  changePassword(){
    this.authSvc.changePassword(this.passwordForm.value)
        .subscribe({
          error:(err:any) =>{
           this.handleError(err);
          },
          next:(resp:any) => {
            this.alertSvc.presentAlert('Éxito', 'Contraseña actualizada');
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
}
