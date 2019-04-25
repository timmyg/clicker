import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';
import { Program } from '../../state/program/program.model';

@Injectable()
export class ProgramService {
  private prefix = `programs`;
  constructor(private httpClient: HttpClient) {}

  getPrograms(): Observable<Program[]> {
    return this.httpClient.get<Program[]>(this.prefix);
  }
}
