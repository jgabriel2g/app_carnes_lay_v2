import { Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertsService } from 'src/app/core/services/alerts.service';
import { ThirdPartyService } from 'src/app/core/services/third-party.service';
import { Client } from 'src/app/core/models/client.model';

@Component({
  selector: 'app-update',
  templateUrl: './update.component.html',
  styleUrls: ['./update.component.scss'],
})
export class UpdateComponent implements OnInit {
  public windowWith: number = window.innerWidth;
  public clientId: string = '';
  public clientInfo: Client | null = null;
  public isLoading: boolean = false;

  constructor(
    private activatedRoute: ActivatedRoute,
    private alertSvc: AlertsService,
    private thirdPartySvc: ThirdPartyService,
    private router: Router
  ) {}

  ngOnInit() {
    this.activatedRoute.params.subscribe((params: any) => {
      this.clientId = params.id;
      this.loadClientData();
    });
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenWidth();
  }

  checkScreenWidth() {
    this.windowWith = window.innerWidth;
  }

  loadClientData() {
    this.isLoading = true;
    this.thirdPartySvc.getClientById(this.clientId).subscribe({
      error: (err: any) => {
        console.error('Error loading client:', err);
        this.handleError(err);
        this.isLoading = false;
      },
      next: (response: any) => {
        this.clientInfo = response;
        this.isLoading = false;
      },
    });
  }

  updateClient(event: any) {
    this.isLoading = true;
    this.thirdPartySvc.updateClient(event, this.clientId).subscribe({
      error: (err: any) => {
        console.error('Error updating client:', err);
        this.handleError(err);
        this.isLoading = false;
      },
      next: (resp: any) => {
        this.alertSvc.presentAlert('Éxito', 'Cliente actualizado');
        this.router.navigateByUrl('/home/clients');
      },
    });
  }

  handleError(err: any) {
    if (err.error) {
      const errorKeys = Object.keys(err.error);
      let errorMessage = '';
      errorKeys.forEach((key) => {
        errorMessage += ` ${err.error[key]}\n`;
      });
      this.alertSvc.presentAlert('Ooops', errorMessage);
    } else {
      this.alertSvc.presentAlert('Ooops', 'An unexpected error occurred.');
    }
  }
}
