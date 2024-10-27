import { Component, HostListener, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { AlertsService } from 'src/app/core/services/alerts.service';
import { PayRollService } from 'src/app/core/services/pay-roll.service';

@Component({
  selector: 'app-update',
  templateUrl: './update.component.html',
  styleUrls: ['./update.component.scss'],
})
export class UpdateComponent  implements OnInit {

  public windowWith:any;
  public isColapsed:boolean = false
  public employeeId:string = '';
  ngOnInit() {
    this.checkScreenWidth();
    this.activatedRoute.params.subscribe(({id}) => {
        this.employeeId = id
    })
  }

  constructor(private alertSvc:AlertsService,  private payrollSvc:PayRollService, private router:Router, private activatedRoute:ActivatedRoute) {
    this.checkScreenWidth();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenWidth();
  }

  checkScreenWidth() {
    this.windowWith = window.innerWidth
  };

  updateEmployee(event:any){
    this.payrollSvc.updatePayroll(this.employeeId ,event)
        .subscribe({
          error:(err:any) =>{
            this.handleError(err);
          },
          next:(resp:any) => {
            this.alertSvc.presentAlert('Éxito', 'Empleado actualizado');
            this.router.navigateByUrl('/home/pay-roll');
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
