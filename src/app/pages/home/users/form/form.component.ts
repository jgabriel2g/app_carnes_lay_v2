import { EventEmitter, HostListener, Input, Output } from '@angular/core';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { GlobalService } from '../../../../core/services/global.service';
import { AlertsService } from '../../../../core/services/alerts.service';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss'],
})
export class FormComponent  implements OnInit{
  public DocTypes:any[] = [];
  @Output() formSubmit: EventEmitter<any> = new EventEmitter<any>();
  @Input() userData:any;
  userForm: FormGroup;
  selectedGroups: number[] = [];
  availableGroups = [
    { value: 2, label: 'Administrador' },
    { value: 3, label: 'Cajero' },
    { value: 4, label: 'Bodeguero' },
  ];

  ngOnInit(): void {

    this.getDocTypes();
    if (this.userData !== undefined) {
        this.userForm.get('username')?.setValue(this.userData.username)
        this.userForm.get('first_name')?.setValue(this.userData.first_name)
        this.userForm.get('last_name')?.setValue(this.userData.last_name)
        this.userForm.get('email')?.setValue(this.userData.email)
        this.userForm.get('phone_number')?.setValue(this.userData.phone_number)
        this.userForm.get('identification_number')?.setValue(this.userData.identification_number)
        this.userForm.get('identification_type')?.setValue(this.userData.identification_type)
        this.userForm.get('groups')?.setValue(this.userData.groups)
        this.userForm.get('password1')?.disable();
        this.userForm.get('password2')?.disable();
    }
  }

  constructor(private fb: FormBuilder, private globalSvc:GlobalService, private alertSvc:AlertsService) {
    this.userForm = this.fb.group({
      username: ['', [Validators.required]],
      password1: ['', [Validators.required]],
      password2: ['', [Validators.required]],
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
      this.formSubmit.emit(this.userForm.value);
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
      this.selectedGroups.push(groupValue);
    } else {
      const index = this.selectedGroups.indexOf(groupValue);
      if (index > -1) {
        this.selectedGroups.splice(index, 1);
      }
    }
    this.userForm.get('groups')?.setValue(this.selectedGroups);
  };

}

