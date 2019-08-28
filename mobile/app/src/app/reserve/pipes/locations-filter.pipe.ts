import { Pipe, PipeTransform } from '@angular/core';
import { Location } from 'src/app/state/location/location.model';

@Pipe({
  name: 'locationsFilter',
})
export class LocationsFilterPipe implements PipeTransform {
  transform(locations: Location[], searchText: string, showHidden: boolean): any[] {
    if (!locations) return [];
    if (!searchText) {
      if (!showHidden) {
        return locations.filter(l => l.hidden !== true);
      }
      return locations;
    }
    searchText = searchText.toLowerCase();
    locations = locations.filter(l => {
      return l.name.toLowerCase().includes(searchText) || l.neighborhood.toLowerCase().includes(searchText);
    });
    if (!showHidden) {
      locations = locations.filter(l => l.hidden !== true);
    }
    return locations;
  }
}
