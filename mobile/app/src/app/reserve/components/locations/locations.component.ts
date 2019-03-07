import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Establishment } from 'src/app/state/location/location.model';

@Component({
  selector: 'app-locations',
  templateUrl: './locations.component.html',
  styleUrls: ['./locations.component.scss'],
})
export class LocationsComponent implements OnInit {
  @Input() locations: Establishment[];
  @Output() chooseLocation = new EventEmitter<Establishment>(true);
  @Output() changeTitle = new EventEmitter<String>(true);
  title = 'Choose Location';

  constructor() {}

  ngOnInit() {
    this.changeTitle.emit(this.title);
  }

  onLocationClick(location: Establishment) {
    this.chooseLocation.emit(location);
  }
}
