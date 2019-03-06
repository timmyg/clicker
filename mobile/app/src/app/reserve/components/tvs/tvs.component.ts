import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { TV } from 'src/app/state/tv/tv.model';

@Component({
  selector: 'app-tvs',
  templateUrl: './tvs.component.html',
  styleUrls: ['./tvs.component.scss'],
})
export class TvsComponent implements OnInit {
  @Input() tvs: TV[];
  @Output() chooseTv = new EventEmitter<TV>();
  @Output() changeTitle = new EventEmitter<String>();
  title = 'Choose TV';

  constructor() {}

  ngOnInit() {
    this.changeTitle.emit(this.title);
  }

  onTvClick(tv: TV) {
    this.chooseTv.emit(tv);
  }
}
