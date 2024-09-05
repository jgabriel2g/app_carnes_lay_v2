import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpHandler, HttpRequest, HttpResponse} from '@angular/common/http';
import { tap, catchError, throwError, BehaviorSubject, Observable, of } from 'rxjs';
import { filter, switchMap, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  constructor(
    private authSvc: AuthService, private router:Router
  ) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<any> {
    return next.handle(req).pipe(
      tap(event => {
        if (event instanceof HttpResponse && req.url.startsWith('https://api.geo-stock.online/api')) {
          const body = event.body;
          if (body && Array.isArray(body.errors) && body.errors.some((error: any) => error && error.message && error.message.toLowerCase() === 'unauthorized')
          ) {
            return this.refreshToken(req, next).subscribe();
          }
        }
        return req.clone();
      }),
      catchError((error: any) => throwError(error))
    );
  }

  private refreshToken(req: HttpRequest<any>, next: HttpHandler): Observable<any> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      const refreshToken = sessionStorage.getItem('refreshToken') || '';
      return this.authSvc.refreshToken(refreshToken).pipe(
        catchError((err: any) => {
          this.isRefreshing = false;
          return this.error(err);
        }),
        tap((resp: any) => {
          this.isRefreshing = false;
          sessionStorage.setItem('accessToken', resp.access);
          sessionStorage.setItem('refreshToken', resp.refresh);
          sessionStorage.setItem('userGroup', resp.user.groups);
          this.refreshTokenSubject.next(resp.data.refreshToken.accessToken);
          location.reload();
        }),
        switchMap((resp: any) => {
          return next.handle(this.addTokenHeader(req, resp.data.refreshToken.accessToken));
        })
      );
    }

    return this.refreshTokenSubject.pipe(
      filter(token => token !== null),
      take(1),
      switchMap((token) => next.handle(this.addTokenHeader(req, token)))
    );
  }

  private addTokenHeader(req: HttpRequest<any>, token: string) {
    return req.clone({
      headers: req.headers
        .set('Authorization', 'Bearer ' + token)
        .set('Accept', 'application/json'),
    });
  }

  private error(x: any): Observable<any> {
    //TODO:
    this.router.navigateByUrl('/auth/login')
    return of(null);
  }
}
