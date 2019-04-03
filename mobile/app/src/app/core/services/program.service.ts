import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, of } from 'rxjs';
import { Program } from '../../state/program/program.model';
import { environment } from 'src/environments/environment';

@Injectable()
export class ProgramService {
  private url = `${environment.apiBaseUrl}/programs`;
  constructor(private httpClient: HttpClient) {}

  getPrograms(): Observable<Array<Program>> {
    return this.httpClient.get<Program[]>(this.url);
  }
}
