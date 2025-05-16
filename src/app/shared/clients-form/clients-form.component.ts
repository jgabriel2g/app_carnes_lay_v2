import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import {
  ReactiveFormsModule,
  FormsModule,
  FormGroup,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { AlertsService } from 'src/app/core/services/alerts.service';
import { GlobalService } from 'src/app/core/services/global.service';
import { Client } from 'src/app/core/models/client.model';

@Component({
  selector: 'app-clients-form',
  templateUrl: './clients-form.component.html',
  styleUrls: ['./clients-form.component.scss'],
  standalone: true,
  imports: [
    ReactiveFormsModule,
    CommonModule,
    RouterModule,
    IonicModule,
    FormsModule,
  ],
})
export class ClientsFormComponent implements OnInit {
  @Output() formSubmit: EventEmitter<any> = new EventEmitter<any>();
  @Input() clientData: Client | null = null;
  @Input() isLoading: boolean = false;
  public clientsForm: FormGroup;
  public DocTypes: any[] = [];
  public Departments: any[] = [];
  public Municipalities: any[] = [];
  public PersonTypes: any[] = [];
  public RegimeTypes: any[] = [];
  public Responsibilities: any[] = [];

  ngOnInit(): void {
    // Deshabilitar el formulario mientras se cargan los datos
    this.clientsForm.disable();

    this.getDocTypes();
    this.getDepartments();
    this.getPersonTypes();
    this.getRegimeType();
    this.getResponsibilities();

    if (this.clientData) {
      const {
        first_name,
        last_name,
        email,
        phone,
        identification_number,
        identification_type,
        address,
        municipality,
        regime_type,
        responsibilities,
        person_type,
        company_name,
      } = this.clientData;

      // Primero cargar los departamentos
      this.globalSvc.getDepartments().subscribe({
        next: (resp: any) => {
          this.Departments = resp.results;

          // Una vez cargados los departamentos, establecer los valores del formulario
          this.clientsForm.patchValue({
            first_name: first_name || '',
            last_name: last_name || '',
            email: email || '',
            phone: phone || '',
            identification_number: identification_number || '',
            identification_type: identification_type?.id || 0,
            address: address || '',
            municipality: municipality?.id || '',
            department: municipality?.department?.id || '',
            regime_type: regime_type?.id || '',
            responsibilities: responsibilities?.id || '',
            person_type: person_type?.id || '',
            company_name: company_name || '',
          });

          // Cargar los municipios del departamento seleccionado
          if (municipality?.department?.id) {
            const selectedDept = this.Departments.find(
              (d) => d.id === municipality.department.id
            );
            if (selectedDept) {
              this.Municipalities = selectedDept.municipalities;
            }
          }

          // Habilitar el formulario una vez que todo esté cargado
          this.clientsForm.enable();
          this.clientsForm.get('digit_check')?.disable();
        },
        error: (err: any) => {
          console.error('Error loading departments:', err);
          this.alertSvc.presentAlert(
            'Error',
            'No se pudieron cargar los datos'
          );
        },
      });
    } else {
      // Si es un nuevo cliente, habilitar el formulario después de cargar los datos básicos
      Promise.all([
        this.getDocTypes(),
        this.getDepartments(),
        this.getPersonTypes(),
        this.getRegimeType(),
        this.getResponsibilities(),
      ])
        .then(() => {
          this.clientsForm.enable();
          this.clientsForm.get('digit_check')?.disable();
        })
        .catch((err) => {
          console.error('Error loading form data:', err);
          this.alertSvc.presentAlert(
            'Error',
            'No se pudieron cargar los datos'
          );
        });
    }
  }

  constructor(
    private fb: FormBuilder,
    private globalSvc: GlobalService,
    private alertSvc: AlertsService
  ) {
    this.clientsForm = this.fb.group({
      first_name: ['', [Validators.required]],
      last_name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      identification_type: [0, [Validators.required, Validators.min(1)]],
      identification_number: ['', [Validators.required]],
      phone: [
        '',
        [
          Validators.required,
          Validators.maxLength(10),
          Validators.minLength(10),
        ],
      ],
      address: ['', [Validators.required]],
      municipality: ['', [Validators.required]],
      department: ['', [Validators.required]],
      digit_check: [
        1,
        [Validators.required, Validators.maxLength(1), Validators.minLength(1)],
      ],
      regime_type: ['', [Validators.required]],
      responsibilities: ['', [Validators.required]],
      person_type: ['', [Validators.required]],
      company_name: ['', [Validators.required]],
    });
  }

  onSubmit() {
    this.clientsForm.markAllAsTouched();
    if (this.clientsForm.valid) {
      this.clientsForm.get('department')?.disable();
      this.formSubmit.emit(this.clientsForm.value);
    } else {
      this.alertSvc.presentAlert('Oooops', 'Revisa los campos');
    }
  }

  getDocTypes() {
    return new Promise<void>((resolve, reject) => {
      this.globalSvc.getDocTypes().subscribe({
        error: (err: any) => reject(err),
        next: (resp: any) => {
          this.DocTypes = resp.results;
          resolve();
        },
      });
    });
  }

  getDepartments() {
    return new Promise<void>((resolve, reject) => {
      this.globalSvc.getDepartments().subscribe({
        error: (err: any) => reject(err),
        next: (resp: any) => {
          this.Departments = resp.results;
          resolve();
        },
      });
    });
  }

  getPersonTypes() {
    return new Promise<void>((resolve, reject) => {
      this.globalSvc.getPersonType().subscribe({
        error: (err: any) => reject(err),
        next: (resp: any) => {
          this.PersonTypes = resp.results;
          resolve();
        },
      });
    });
  }

  getRegimeType() {
    return new Promise<void>((resolve, reject) => {
      this.globalSvc.getRegimeType().subscribe({
        error: (err: any) => reject(err),
        next: (resp: any) => {
          this.RegimeTypes = resp.results;
          resolve();
        },
      });
    });
  }

  getResponsibilities() {
    return new Promise<void>((resolve, reject) => {
      this.globalSvc.getResponsibilities().subscribe({
        error: (err: any) => reject(err),
        next: (resp: any) => {
          this.Responsibilities = resp.results;
          resolve();
        },
      });
    });
  }

  catchMunicipalities() {
    const departmentId = this.clientsForm.get('department')?.value;
    if (departmentId) {
      const selectedDept = this.Departments.find((d) => d.id === departmentId);
      if (selectedDept) {
        this.Municipalities = selectedDept.municipalities;
        this.clientsForm.patchValue({ municipality: '' });
      }
    } else {
      this.Municipalities = [];
      this.clientsForm.patchValue({ municipality: '' });
    }
  }
}
