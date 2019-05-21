import { Pipe, PipeTransform } from '@angular/core';
import { Location } from 'src/app/state/location/location.model';

@Pipe({
  name: 'locationsFilter',
})
export class LocationsFilterPipe implements PipeTransform {
  transform(locations: Location[], searchText: string): any[] {
    if (!locations) return [];
    if (!searchText) return locations;
    searchText = searchText.toLowerCase();
    return locations.filter(p => {
      return p.name.toLowerCase().includes(searchText) || p.neighborhood.toLowerCase().includes(searchText);
    });
  }
}
