import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Plan } from 'src/app/state/app/plan.model';
import { Timeframe } from 'src/app/state/app/timeframe.model';

@Injectable()
export class AppService {
  private prefix = `app`;
  constructor(private httpClient: HttpClient) {}

  getPlans(): Observable<Plan[]> {
    return this.httpClient.get<Plan[]>(`${this.prefix}/buy`);
  }

  getTimeframes(): Observable<Timeframe[]> {
    return this.httpClient.get<Timeframe[]>(`${this.prefix}/timeframes`);
  }
}
