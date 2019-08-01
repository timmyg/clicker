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
              icon = '⚾';
            } else if (program.subcategories.indexOf('Basketball') > -1) {
              icon = '🏀';
            } else if (program.subcategories.indexOf('Soccer') > -1) {
              icon = '⚽';
            } else if (program.subcategories.indexOf('Football') > -1) {
              icon = '🏈';
            } else if (program.subcategories.indexOf('Golf') > -1) {
              icon = '⛳';
            } else if (program.subcategories.indexOf('Tennis') > -1) {
              icon = '🎾';
            } else if (program.subcategories.indexOf('Horse') > -1) {
              icon = '🏇';
            } else if (program.subcategories.indexOf('Motorcycle') > -1) {
              icon = '🏍️';
            } else if (program.subcategories.indexOf('Auto') > -1) {
              icon = '🏎️';
            }
          }
          program.icon = icon || '📺';
        });
        return programs;
      }),
    );
  }
}
