import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { Program } from 'src/app/state/program/program.model';
import { Store } from '@ngrx/store';
import { getAllPrograms } from 'src/app/state/program';
import { getReservation } from 'src/app/state/reservation';
import * as fromStore from '../../../state/app.reducer';
import * as fromProgram from '../../../state/program/program.actions';
import * as fromReservation from '../../../state/reservation/reservation.actions';
import { Router, ActivatedRoute } from '@angular/router';
import { ReserveService } from '../../reserve.service';
import { Reservation } from 'src/app/state/reservation/reservation.model';

@Component({
  templateUrl: './programs.component.html',
  styleUrls: ['./programs.component.scss'],
})
export class ProgramsComponent {
  programs$: Observable<Program[]>;
  reservation$: Observable<Partial<Reservation>>;
  title = 'Choose Game';
  searchTerm: string;

  constructor(
    private store: Store<fromStore.AppState>,
    private reserveService: ReserveService,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.programs$ = this.store.select(getAllPrograms);
    this.reservation$ = this.store.select(getReservation);
    this.reserveService.emitTitle(this.title);
    this.reserveService.searchTermEmitted$.subscribe(searchTerm => {
      this.searchTerm = searchTerm;
    });
    this.reserveService.closeSearchEmitted$.subscribe(() => {
      this.searchTerm = null;
    });
  }

  ngOnInit() {
    this.reservation$.subscribe(r => {
      this.store.dispatch(new fromProgram.GetAllByLocation(r.location));
    });
  }

  onProgramClick(program: Program) {
    this.store.dispatch(new fromReservation.SetProgram(program));
    this.router.navigate(['../tvs'], { relativeTo: this.route });
  }
}
