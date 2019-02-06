import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { getAllTvs } from 'src/app/state/tv';
import * as fromStore from '../../../state/app.reducer';
import * as fromTv from '../../../state/tv/tv.actions';
import { Observable } from 'rxjs';
import { TV } from 'src/app/state/tv/tv.model';
import { Store } from '@ngrx/store';
import { Establishment } from 'src/app/state/location/location.model';

@Component({
  selector: 'app-tvs',
  templateUrl: './tvs.component.html',
  styleUrls: ['./tvs.component.scss'],
})
export class TvsComponent implements OnInit {
  @Output() chooseTv = new EventEmitter<TV>();
  @Input() tvs: TV[];

  constructor() {}

  ngOnInit() {}

  onTvClick(tv: TV) {
    this.chooseTv.emit(tv);
  }
}
