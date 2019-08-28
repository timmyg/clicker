import { Pipe, PipeTransform } from '@angular/core';
import { Program } from 'src/app/state/program/program.model';

@Pipe({
  name: 'programsFilter',
})
export class ProgramsFilterPipe implements PipeTransform {
  transform(programs: Program[], searchText: string): any[] {
    if (!programs) return [];
    if (!searchText) return programs;
    searchText = searchText.toLowerCase();
    return programs.filter(p => {
      return (
        p.channelTitle.toLowerCase().includes(searchText) || (p.title && p.title.toLowerCase().includes(searchText))
      );
    });
  }
}
