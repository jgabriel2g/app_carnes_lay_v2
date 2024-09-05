import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AlertsService } from 'src/app/core/services/alerts.service';
import { GlobalService } from 'src/app/core/services/global.service';
import { ProfileService } from '../../core/services/profile.service';

@Component({
  selector: 'app-users-form',
  templateUrl: './users-form.component.html',
  styleUrls: ['./users-form.component.scss'],
  standalone:true,
  imports:[
    FormsModule,
    CommonModule,
    RouterModule,
    ReactiveFormsModule
  ]
})
export class UsersFormComponent  implements OnInit {

  public DocTypes:any[] = [];
  @Output() formSubmit: EventEmitter<any> = new EventEmitter<any>();

  userForm: FormGroup;
  availableGroups = [
    { value: 1, label: 'Owner' },
    { value: 2, label: 'Admin' },
    { value: 3, label: 'Cashier' },
    { value: 4, label: 'Warehouse manager.' },
  ];
  selectedGroups: number[] = [];

  ngOnInit(): void {
    this.getDocTypes();
    this.getProfileInfo();
  }

  constructor(private fb: FormBuilder, private globalSvc:GlobalService, private alertSvc:AlertsService, private profileSvc:ProfileService) {
    this.userForm = this.fb.group({
      username: ['', [Validators.required]],

      first_name: ['', [Validators.required]],
      last_name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      phone_number: ['', [Validators.required]],
      identification_number: ['', [Validators.required]],
      identification_type: [0, [Validators.required, Validators.min(1)]],
      groups: [[], [Validators.required]]
    });
  }

  onSubmit() {
    this.userForm.markAllAsTouched();
    if (this.userForm.valid) {
        this.updateUser();
    } else {
      console.log('Formulario no válido', this.userForm.value);
      this.alertSvc.presentAlert('Oooops', 'Revisa los campos')
    }
  }

  getDocTypes(){
    this.globalSvc.getDocTypes()
        .subscribe({
          error:(err:any) => {
            console.log(err);
          },
          next:(resp:any) => {
            this.DocTypes = resp.results;
          }
        });
  };


  toggleGroup(event: Event, groupValue: number) {
    const inputElement = event.target as HTMLInputElement;
    const isChecked = inputElement.checked;

    if (isChecked) {
      // Si el checkbox está seleccionado, lo agregamos al array
      this.selectedGroups.push(groupValue);
    } else {
      // Si el checkbox se deselecciona, lo quitamos
      const index = this.selectedGroups.indexOf(groupValue);
      if (index > -1) {
        this.selectedGroups.splice(index, 1);
      }
    }
    // Actualizamos el control del formulario
    this.userForm.get('groups')?.setValue(this.selectedGroups);
  };

  getProfileInfo(){
    this.profileSvc.getProfileInfo()
        .subscribe({
          error:(err:any) => {
            console.log(err);
          },
          next:(resp:any) => {
            console.log(resp)
            this.userForm.get('username')?.setValue(resp.username)
            this.userForm.get('first_name')?.setValue(resp.first_name)
            this.userForm.get('last_name')?.setValue(resp.last_name)
            this.userForm.get('email')?.setValue(resp.email)
            this.userForm.get('phone_number')?.setValue(resp.phone_number)
            this.userForm.get('identification_number')?.setValue(resp.identification_number)
            this.userForm.get('identification_type')?.setValue(resp.identification_type)
            this.userForm.get('groups')?.setValue(resp.groups)
            this.selectedGroups = resp.groups
          }
        });
  };

  updateUser(){
    this.profileSvc.updateUserInfo(this.userForm.value)
      .subscribe({
          error:(err:any) =>{
              console.log(err);
              this.alertSvc.presentAlert('','')
            },
            next:(resp:any) => {
              this.alertSvc.presentAlert('Éxito', 'Perfíl actualizado');
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
