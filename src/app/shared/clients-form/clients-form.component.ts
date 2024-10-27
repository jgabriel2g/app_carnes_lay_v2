import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ReactiveFormsModule, FormsModule, FormGroup, FormBuilder, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { AlertsService } from 'src/app/core/services/alerts.service';
import { GlobalService } from 'src/app/core/services/global.service';

@Component({
  selector: 'app-clients-form',
  templateUrl: './clients-form.component.html',
  styleUrls: ['./clients-form.component.scss'],
  standalone: true,
  imports:[
    ReactiveFormsModule,
    CommonModule,
    RouterModule,
    IonicModule,
    FormsModule
  ]
})
export class ClientsFormComponent  implements OnInit {

  @Output() formSubmit: EventEmitter<any> = new EventEmitter<any>();
  @Input() clientData:any;
  public clientsForm: FormGroup;
  public DocTypes:any[] = [];
  public Departments:any[] = [];
  public Municipalities:any[] = [];
  public PersonTypes:any[] = [];
  public RegimeTypes:any[] = [];
  public Responsibilities:any[] = [];
  public isLoading:boolean = false;

  ngOnInit(): void {
    this.getDocTypes();
    this.getDepartments();
    this.getPersonTypes();
    this.getRegimeType();
    this.getResponsibilities();
    if (this.clientData !== undefined) {
        this.clientsForm.get('first_name')?.setValue(this.clientData.first_name)
        this.clientsForm.get('last_name')?.setValue(this.clientData.last_name)
        this.clientsForm.get('email')?.setValue(this.clientData.email)
        this.clientsForm.get('phone')?.setValue(this.clientData.phone)
        this.clientsForm.get('identification_number')?.setValue(this.clientData.identification_number)
        this.clientsForm.get('identification_type')?.setValue(this.clientData.identification_type.id)
        this.clientsForm.get('address')?.setValue(this.clientData.address)
        this.clientsForm.get('municipality')?.setValue(this.clientData.municipality);
        this.getDepartments();
    };
    this.clientsForm.get('digit_check')?.disable()
  }

  constructor(private fb: FormBuilder, private globalSvc:GlobalService, private alertSvc:AlertsService) {
    this.clientsForm = this.fb.group({
      first_name: ['', [Validators.required]],
      last_name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      identification_type: [0, [Validators.required, Validators.min(1)]],
      identification_number: ['', [Validators.required]],
      phone: ['', [Validators.required, Validators.maxLength(10), Validators.minLength(10)]],
      address: ['', [Validators.required]],
      municipality: ['', [Validators.required]],
      department: ['', [Validators.required]],
      digit_check: [1, [Validators.required, Validators.maxLength(1), Validators.minLength(1)]],
      regime_type: ['', [Validators.required]],
      responsibilities: ['', [Validators.required]],
      person_type: ['', [Validators.required]],
      companyName: ['', [Validators.required]],
    });
  }

  onSubmit() {
    this.clientsForm.markAllAsTouched();
    if (this.clientsForm.valid) {
      this.isLoading = true;
      this.clientsForm.get('department')?.disable();
      this.formSubmit.emit(this.clientsForm.value);
    } else {
      this.alertSvc.presentAlert('Oooops', 'Revisa los campos')
    }
  }

  getDocTypes(){
    this.globalSvc.getDocTypes()
        .subscribe({
          error:(err:any) => {
          },
          next:(resp:any) => {
            this.DocTypes = resp.results;
          }
        });
  };

  getDepartments(){
    this.globalSvc.getDepartments()
        .subscribe({
          error:(err:any) => {
          },
          next:(resp:any) => {
            console.log(resp)
            this.Departments = resp.results;
          }
        });
  };

  getPersonTypes(){
    this.globalSvc.getPersonType()
        .subscribe({
          error:(err:any) => {
            console.log(err);
          },
          next:(resp:any) => {
            console.log(resp);
            this.PersonTypes = resp.results
          }
        });
  };

  getRegimeType(){
    this.globalSvc.getRegimeType()
        .subscribe({
          error:(err:any) => {
            console.log(err);
          },
          next:(resp:any) => {
             console.log(resp);
             this.RegimeTypes = resp.results;
          }
        });
  };

  getResponsibilities(){
     this.globalSvc.getResponsibilities()
          .subscribe({
            error:(err:any) => {
              console.log(err);
            },
            next:(resp:any) => {
              console.log(resp)
              this.Responsibilities = resp.results;
            }
          });
  }



  catchMunicipalities(){
   let selectedDept =  this.Departments.find( d => d.id === this.clientsForm.get('department')?.value)
   this.Municipalities = selectedDept.municipalities;
  };
}
