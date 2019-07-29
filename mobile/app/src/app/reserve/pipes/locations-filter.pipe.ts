import { Pipe, PipeTransform } from '@angular/core';
import { Location } from 'src/app/state/location/location.model';

@Pipe({
  name: 'locationsFilter',
})
export class LocationsFilterPipe implements PipeTransform {
  transform(locations: Location[], searchText: string, showHidden): any[] {
    console.log(showHidden);
    if (!locations) return [];
    if (!searchText) return locations;
    searchText = searchText.toLowerCase();
    return locations.filter(l => {
      return (
        (l.hidden === showHidden && l.name.toLowerCase().includes(searchText)) ||
        l.neighborhood.toLowerCase().includes(searchText)
      );
    });
  }
}
