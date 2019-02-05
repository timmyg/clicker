import { Component, OnInit, Input } from '@angular/core';
import { Establishment } from 'src/app/state/location/location.model';

@Component({
  selector: 'app-locations',
  templateUrl: './locations.component.html',
  styleUrls: ['./locations.component.scss'],
})
export class LocationsComponent implements OnInit {
  @Input() locations: Establishment[];

  constructor() {}

  ngOnInit() {}
}
