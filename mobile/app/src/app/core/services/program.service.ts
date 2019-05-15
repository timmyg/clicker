import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';
import { Program } from '../../state/program/program.model';
import { map } from 'rxjs/operators';

@Injectable()
export class ProgramService {
  private prefix = `programs`;
  constructor(private httpClient: HttpClient) {}

  getPrograms(): Observable<Program[]> {
    // return this.httpClient.get<Program[]>(this.prefix);
    return this.httpClient.get<Program[]>(this.prefix).pipe(
      map((programs: Program[]) => {
        programs.forEach(program => {
          let points = 0;
          let icon;
          // set icon
          if (program.subcategories) {
            if (program.subcategories.indexOf('Baseball') > -1) {
              icon = 'baseball';
              points += 2;
            } else if (program.subcategories.indexOf('Basketball') > -1) {
              icon = 'basketball';
              points += 2;
            } else if (program.subcategories.indexOf('Soccer') > -1) {
              icon = 'football';
              points += 2;
            } else if (program.subcategories.indexOf('Football') > -1) {
              icon = 'american-football';
              points += 2;
            }
          }
          program.icon = icon || 'tv';
          // set rankings points
          if (program.title) {
            if (program.title.indexOf('vs. ') > -1) {
              points += 2;
            }
          } else {
            points -= 10;
          }
          program.points = points;
        });
        return programs.sort((a, b) => b.points - a.points);
      }),
    );
  }
}
