import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { AuthService } from '../services/auth.service'; // Asumiendo que tienes un AuthService que maneja la autenticación
import { rolesPermissions } from '../utils/roles';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  public userRoles:any;
  public rolesPermissions = rolesPermissions
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): boolean {

    if (sessionStorage.getItem('userGroup') !== undefined) {
      this.userRoles = JSON.parse(sessionStorage.getItem('userGroup') || '');
    } else {
      this.router.navigateByUrl('')
    }

    const requiredPermissions = route.data['permissions'];

    const hasPermission = this.userRoles.some((role:any) => {
      const rolePermissions = this.rolesPermissions[role].permissions;
      return rolePermissions.some((permission:any) => requiredPermissions.includes(permission));
    });

    if (!hasPermission) {
      this.router.navigate(['']);
      return false;
    }

    return true;
  }
}
