import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup, FormBuilder, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AlertsService } from 'src/app/core/services/alerts.service';
import { GlobalService } from 'src/app/core/services/global.service';
import { addIcons } from "ionicons";
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-providers-form',
  templateUrl: './providers-form.component.html',
  styleUrls: ['./providers-form.component.scss'],
  standalone: true,
  imports:[
    ReactiveFormsModule,
    CommonModule,
    RouterModule,
    IonicModule,
    FormsModule
  ]
})
export class ProvidersFormComponent  implements OnInit {

  public DocTypes:any[] = [];
  public Departments:any[] = [];
  public Municipalities:any[] = [];
  public providersForm: FormGroup;
  public isLoading:boolean = false;
  @Output() formSubmit: EventEmitter<any> = new EventEmitter<any>();
  @Input() providerData:any;

  async ngOnInit() {
    this.getDocTypes();
    this.getDepartments();
    if (this.providerData !== undefined) {
        this.providersForm.get('first_name')?.setValue(this.providerData.first_name)
        this.providersForm.get('last_name')?.setValue(this.providerData.last_name)
        this.providersForm.get('email')?.setValue(this.providerData.email)
        this.providersForm.get('phone')?.setValue(this.providerData.phone)
        this.providersForm.get('identification_number')?.setValue(this.providerData.identification_number)
        this.providersForm.get('identification_type')?.setValue(this.providerData.identification_type.id)
        this.providersForm.get('address')?.setValue(this.providerData.address)
        this.providersForm.get('department')?.setValue(this.providerData.municipality.department.id);
        this.providersForm.get('municipality')?.setValue(this.providerData.municipality.id);
    };
  };

  constructor(private fb: FormBuilder, private globalSvc:GlobalService, private alertSvc:AlertsService) {
    this.providersForm = this.fb.group({
      first_name: ['', [Validators.required]],
      last_name: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      identification_type: [0, [Validators.required, Validators.min(1)]],
      identification_number: ['', [Validators.required]],
      phone: ['', [Validators.required, Validators.maxLength(10), Validators.minLength(10)]],
      address: ['', [Validators.required]],
      municipality: ['', [Validators.required]],
      department: ['', [Validators.required]],
    });
  }

  onSubmit() {
    this.providersForm.markAllAsTouched();
    if (this.providersForm.valid) {
      this.isLoading = true;
      this.providersForm.get('department')?.disable();
      this.formSubmit.emit(this.providersForm.value);
    } else {
      this.alertSvc.presentAlert('Oooops', 'Revisa los campos')
    };
  };

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
            this.Departments = resp.results;
            if (this.providerData !== undefined) {
              this.catchMunicipalities();
            }
          }
        });
  };

  catchMunicipalities(){
   let selectedDept =  this.Departments.find( d => d.id === this.providersForm.get('department')?.value)
   this.Municipalities = selectedDept.municipalities;
  };
}
