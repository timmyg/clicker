import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { Plan } from 'src/app/state/app/plan.model';

@Injectable()
export class AppService {
  private prefix = `apps`;
  constructor(private httpClient: HttpClient) {}

  getPlans(): Observable<Plan[]> {
    return this.httpClient.get<Plan[]>(`${this.prefix}/plans`);
  }
}
