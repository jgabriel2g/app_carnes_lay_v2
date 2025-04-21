import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { MetricResponse } from '../models/metric';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class MetricsService {
  constructor(private authSvc: AuthService, private http: HttpClient) {}

  getMetrics(startDate?: string, endDate?: string): Observable<MetricResponse> {
    let url = `${this.authSvc.baseUrl}/sale/metric/get_metrics/`;
    if (startDate && endDate) {
      url += `?start_date=${startDate}&end_date=${endDate}`;
    }
    return this.http.get<MetricResponse>(url, this.authSvc.header);
  }

  getMetricsByUrl(url: string): Observable<MetricResponse> {
    return this.http.get<MetricResponse>(url, this.authSvc.header);
  }
}
