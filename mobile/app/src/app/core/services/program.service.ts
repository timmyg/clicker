import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';
import { Program } from '../../state/program/program.model';
import { Location } from '../../state/location/location.model';
import { map } from 'rxjs/operators';

@Injectable()
export class ProgramService {
  private prefix = `programs`;
  constructor(private httpClient: HttpClient) {}

  getPrograms(location: Location): Observable<Program[]> {
    return this.httpClient.get<Program[]>(`${this.prefix}/location/${location.id}`).pipe(
      map((programs: Program[]) => {
        programs.forEach(program => {
          let icon;
          if (program.subcategories) {
            if (program.subcategories.indexOf('Baseball') > -1) {
              icon = 'baseball';
            } else if (program.subcategories.indexOf('Basketball') > -1) {
              icon = 'basketball';
            } else if (program.subcategories.indexOf('Soccer') > -1) {
              icon = 'football';
            } else if (program.subcategories.indexOf('Football') > -1) {
              icon = 'american-football';
            }
          }
          program.icon = icon || 'tv';
        });
        return programs;
      }),
    );
  }
}
