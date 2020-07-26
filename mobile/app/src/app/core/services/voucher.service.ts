import { Injectable } from "@angular/core";
import { Observable, from, of, Subject } from "rxjs";
import { HttpClient } from "@angular/common/http";

@Injectable({
  providedIn: "root",
})
export class VoucherService {
  private prefix = `vouchers`;
  constructor(private httpClient: HttpClient) {}

  redeem(code: string): Observable<boolean> {
    return this.httpClient.post<any>(`${this.prefix}/redeem`, { code });
  }
}
