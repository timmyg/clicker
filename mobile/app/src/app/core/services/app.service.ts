import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { Plan } from "src/app/state/app/plan.model";
import { Timeframe } from "src/app/state/app/timeframe.model";
import { version } from "../../../../package.json";

@Injectable()
export class AppService {
  private prefix = `app`;
  private _version: string;
  constructor(private httpClient: HttpClient) {}

  getPlans(): Observable<Plan[]> {
    return this.httpClient.get<Plan[]>(`${this.prefix}/buy`);
  }

  getTimeframes(locationId): Observable<Timeframe[]> {
    const params = {
      locationId
    };
    return this.httpClient.get<Timeframe[]>(`${this.prefix}/timeframes`, {
      params
    });
  }

  getVersion(): string {
    if (!this._version) {
      this._version = version;
    }
    return this._version;
  }
}
