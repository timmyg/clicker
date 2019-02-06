import { Component, OnInit, Input, Output, EventEmitter, OnChanges } from '@angular/core';
import { Establishment } from 'src/app/state/location/location.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-locations',
  templateUrl: './locations.component.html',
  styleUrls: ['./locations.component.scss'],
})
export class LocationsComponent implements OnInit {
  @Output() chooseLocation = new EventEmitter<Establishment>();
  @Input() locations: Establishment[];

  constructor() {}

  ngOnInit() {}

  ngOnChanges() {}

  onLocationClick(location: Establishment) {
    this.chooseLocation.emit(location);
  }
}
