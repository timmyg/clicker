import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { Program } from 'src/app/state/program/program.model';
import { Store } from '@ngrx/store';
import { getAllPrograms, getLoading } from 'src/app/state/program';
import { getReservation } from 'src/app/state/reservation';
import * as fromStore from '../../../state/app.reducer';
import * as fromProgram from '../../../state/program/program.actions';
import * as fromReservation from '../../../state/reservation/reservation.actions';
import { Router, ActivatedRoute } from '@angular/router';
import { ReserveService } from '../../reserve.service';
import { Reservation } from 'src/app/state/reservation/reservation.model';
import { first, take } from 'rxjs/operators';

@Component({
  templateUrl: './programs.component.html',
  styleUrls: ['./programs.component.scss'],
})
export class ProgramsComponent {
  programs$: Observable<Program[]>;
  reservation$: Observable<Partial<Reservation>>;
  isLoading$: Observable<boolean>;
  title = 'Choose Channel';
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
    this.isLoading$ = this.store.select(getLoading);
    this.reservation$
      .pipe(take(1))
      .subscribe(reservation => this.store.dispatch(new fromProgram.GetAllByLocation(reservation.location)));
  }

  async onProgramClick(program: Program) {
    this.store.dispatch(new fromReservation.SetProgram(program));
    // if editing, may already have a tv
    const state = await this.store.pipe(first()).toPromise();
    const reservation: Partial<Reservation> = state.reservation.reservation;
    if (reservation.id && reservation.box && reservation.box.label) {
      this.router.navigate(['../confirmation'], { relativeTo: this.route, queryParamsHandling: 'merge' });
    } else {
      this.router.navigate(['../tvs'], { relativeTo: this.route, queryParamsHandling: 'merge' });
    }
  }
}
