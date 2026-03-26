import {
  Component,
  EventEmitter,
  HostListener,
  OnInit,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-side-bar',
  templateUrl: './side-bar.component.html',
  styleUrls: ['./side-bar.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule],
})
export class SideBarComponent implements OnInit {
  @Output() toggleSidebar = new EventEmitter<boolean>();

  public windowWith: any;
  public showInventoryMenu: boolean = false;
  public showSalesMenu: boolean = false;
  public isCollapsed: boolean = false;

  ngOnInit() {
    this.checkScreenWidth();
  }

  constructor(public authSvc: AuthService, private router: Router) {
    this.checkScreenWidth();
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkScreenWidth();
  }

  checkScreenWidth() {
    this.windowWith = window.innerWidth;
  }

  toCollapse() {
    this.isCollapsed = !this.isCollapsed;
    this.toggleSidebar.emit(this.isCollapsed);
  }

  onLogout() {
    this.authSvc.logout();
    this.router.navigate(['/auth/login']).then();
  }
}
