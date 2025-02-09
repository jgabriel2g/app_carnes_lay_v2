import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AlertsService } from 'src/app/core/services/alerts.service';
import { GlobalService } from 'src/app/core/services/global.service';
import { ProfileService } from '../../core/services/profile.service';
import {AuthService} from "../../core/services/auth.service";
import { User } from 'src/app/core/models/auth.model';
import { DocType } from 'src/app/core/models/docType.model';

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
  @Output() formSubmit: EventEmitter<any> = new EventEmitter<any>();

  public docTypes: DocType[] = [];

  public userForm: FormGroup = this.fb.group({
    username: ['', [Validators.required]],
    first_name: ['', [Validators.required]],
    last_name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    phone_number: ['', [Validators.required]],
    identification_number: ['', [Validators.required]],
    identification_type: [null, [Validators.required, Validators.min(1)]],
    groups: [[], [Validators.required]]
  });

  public availableGroups = [
    { value: 1, label: 'Owner' },
    { value: 2, label: 'Administrador' },
    { value: 3, label: 'Cajero' },
    { value: 4, label: 'Bodeguero' },
  ];

  constructor(
    private fb: FormBuilder,
    private globalSvc: GlobalService,
    private profileSvc: ProfileService,
    private alertSvc: AlertsService
  ) {}

  ngOnInit(): void {
    this.loadDocTypes();
    this.loadUserProfile();
  }

  /**
   * Cargar tipos de documento desde la API
   */
  private loadDocTypes(): void {
    this.globalSvc.getDocTypes().subscribe({
      next: (resp: { results: DocType[] }) => {
        this.docTypes = resp.results;
      },
      error: (err) => this.handleError(err)
    });
  }

  /**
   * Cargar datos de usuario para rellenar el formulario
   */
  private loadUserProfile(): void {
    this.profileSvc.getProfileInfo().subscribe({
      next: (resp: User) => {
        this.userForm.patchValue(resp);
      },
      error: (err) => this.handleError(err)
    });
  }

  /**
   * Manejar el check de los grupos (roles)
   */
  toggleGroup(event: Event, groupValue: number): void {
    const inputElement = event.target as HTMLInputElement;
    const groupsControl = this.userForm.get('groups');
    if (!groupsControl) return;

    let groups = groupsControl.value as number[];

    groups = inputElement.checked
      ? [...groups, groupValue]
      : groups.filter(g => g !== groupValue);

    groupsControl.setValue(groups);
  }

  /**
   * Enviar el formulario para actualizar el usuario
   */
  onSubmit(): void {
    this.userForm.markAllAsTouched();
    if (this.userForm.valid) {
      this.updateUser();
    } else {
      this.alertSvc.presentAlert('Oooops', 'Revisa los campos').then();
    }
  }

  /**
   * Consumir servicio para actualizar la información del usuario
   */
  private async updateUser() {
    try {
      this.profileSvc.updateUserInfo(this.userForm.value);
      this.alertSvc.presentAlert('Éxito', 'Perfil actualizado');
    } catch (err) {
      this.handleError(err);
    }
  }

  /**
   * Manejo centralizado de errores
   */
  private handleError(err: any) {
    if (err?.error) {
      const errorMessage = Object.values(err.error).join('\n');
      this.alertSvc.presentAlert('Ooops', errorMessage);
    } else {
      this.alertSvc.presentAlert('Ooops', 'Ha ocurrido un error inesperado.');
    }
  }
}
