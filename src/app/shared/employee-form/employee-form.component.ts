import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AlertsService } from 'src/app/core/services/alerts.service';
import { GlobalService } from 'src/app/core/services/global.service';
import { PayRollService } from '../../core/services/pay-roll.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-employee-form',
  templateUrl: './employee-form.component.html',
  styleUrls: ['./employee-form.component.scss'],
  standalone:true,
  imports:[
    ReactiveFormsModule,
    CommonModule,
    FormsModule,
    RouterModule
  ]
})
export class EmployeeFormComponent  implements OnInit {
  @Output() formSubmit: EventEmitter<any> = new EventEmitter<any>();
  public employeeForm: FormGroup;

  public ContractTypes:any[] = [];
  public BankInformation:any[] = [];
  public AccountTypes:any[] = [];
  public DocTypes:any[] = [];
  public Departments:any[] = [];
  public Municipalities:any[] = [];
  public Periods:any[] = [];
  public PaymentMethods:any[] = [];
  public isLoading:boolean = false;
  constructor(private payrollSvc:PayRollService, private fb: FormBuilder, private globalSvc:GlobalService, private alertSvc:AlertsService, ) {
    this.employeeForm = this.fb.group({
      first_name: ['', Validators.required],
      last_name: ['', Validators.required],
      identification_type: ['', Validators.required],
      identification_number: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', Validators.required],
      residence_address: ['', Validators.required],
      municipality: ['', Validators.required],
      department: ['', Validators.required],
      contract: this.fb.group({
        start_date_contract: ['', Validators.required],
        end_date_contract: ['', Validators.required],
        contract_type: ['', Validators.required],
        salary: ['', Validators.required],
        period: ['', Validators.required],
        payment_method: ['', Validators.required],
        high_risk: [false],
        integral_salary: [false],
        transportation_allowance: [false],
      }),
      bank_information: this.fb.group({
        account_type: ['', Validators.required],
        number_account: ['', Validators.required]
      })
    })
  }

  ngOnInit() {
    this.getContractTypes();
    this.getBankInformation();
    this.getAccountTypes();
    this.getDocTypes();
    this.getDepartments();
    this.getPeriods();
    this.getPaymentMethods();
    this.getEmployeInfo();
  }

  getContractTypes(){
    this.payrollSvc.getContractTypes()
        .subscribe({
          error:(err:any) => {
            console.log(err);
          },
          next:(resp:any) => {
            this.ContractTypes = resp.results;
          }
        });
  };

  getBankInformation(){
    this.payrollSvc.getBankInformation()
        .subscribe({
          error:(err:any) => {
            console.log(err);
          },
          next:(resp:any) => {
            this.BankInformation = resp.results;

          }
        });
  };

  getAccountTypes(){
    this.payrollSvc.getAccountTypes()
        .subscribe({
          error:(err:any) => {
            console.log(err);
          },
          next:(resp:any) => {
            this.AccountTypes = resp.results;
          }
        });
  };

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

  getDepartments(){
    this.globalSvc.getDepartments()
        .subscribe({
          error:(err:any) => {
            console.log(err);
          },
          next:(resp:any) => {
            this.Departments = resp.results;
          }
        });
  };

  getPeriods(){
    this.payrollSvc.getPeriods()
        .subscribe({
          error:(err:any) => {
            console.log(err);
          },
          next:(resp:any) => {
            this.Periods = resp.results;
          }
        })
  };

  getPaymentMethods(){
    this.globalSvc.getPaymentMethods()
        .subscribe({
          error:(err:any) => {
            console.log(err);
          },
          next:(resp:any) => {
            this.PaymentMethods = resp.results
          }
        });
  };

  catchMunicipalities(){
    let selectedDept =  this.Departments.find( d => d.id === this.employeeForm.get('department')?.value)
    this.Municipalities = selectedDept.municipalities;
  };

  onSubmit() {
    if (this.employeeForm.valid) {
      this.employeeForm.get('department')?.disable();
      this.formSubmit.emit(this.employeeForm.value)
      // Aquí puedes enviar los datos al backend
    } else {
      this.employeeForm.markAllAsTouched();
    };
  };

  // Método para mostrar el mensaje de error
  getErrorMessage(field: string): string {
    const control = this.employeeForm.get(field);
    if (control?.hasError('required')) {
      return 'Campo requerido';
    } else if (control?.hasError('email')) {
      return 'Formato de correo inválido';
    }
    return '';
  };

  getEmployeInfo(){
    const employee = JSON.parse(sessionStorage.getItem('employee') || '')
    if (employee == '') {

    } else {
      console.log(employee);

      this.employeeForm.get('first_name')?.setValue(employee?.first_name)
      this.employeeForm.get('last_name')?.setValue(employee?.last_name)
      this.employeeForm.get('identification_type')?.setValue(employee?.identification_type.id)
      this.employeeForm.get('identification_number')?.setValue(employee?.identification_number)
      this.employeeForm.get('email')?.setValue(employee?.email)
      this.employeeForm.get('phone')?.setValue(employee?.phone)
      this.employeeForm.get('residence_address')?.setValue(employee?.residence_address)
      this.employeeForm.get('municipality')?.setValue(employee?.municipality.id)
      this.employeeForm.get('department')?.setValue(employee?.municipality.department.id)
      this.employeeForm.get('contract.start_date_contract')?.setValue(employee?.contract.start_date_contract)
      this.employeeForm.get('contract.end_date_contract')?.setValue(employee?.contract.end_date_contract)
      this.employeeForm.get('contract.contract_type')?.setValue(employee?.contract.contract_type.id)
      this.employeeForm.get('contract.salary')?.setValue(employee?.contract.salary)
      this.employeeForm.get('contract.period')?.setValue(employee?.contract.period.id)
      this.employeeForm.get('contract.payment_method')?.setValue(employee?.contract.payment_method.id)
      this.employeeForm.get('contract.high_risk')?.setValue(employee?.contract.high_risk)
      this.employeeForm.get('contract.integral_salary')?.setValue(employee?.contract.integral_salary)
      this.employeeForm.get('contract.transportation_allowance')?.setValue(employee?.contract.transportation_allowance)
      this.employeeForm.get('contract.transportation_allowance')?.setValue(employee?.contract.transportation_allowance)
      this.employeeForm.get('bank_information.account_type')?.setValue(employee?.bank_information.account_type.id)
      this.employeeForm.get('bank_information.number_account')?.setValue(employee?.bank_information.number_account)
    }
  }
}
