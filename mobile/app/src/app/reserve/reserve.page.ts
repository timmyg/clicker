import { Component, OnInit, ViewChild } from '@angular/core';
import { NavController, Events, IonSearchbar } from '@ionic/angular';
import { ReserveService } from './reserve.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import * as fromStore from '../state/app.reducer';
import * as fromReservation from '../state/reservation/reservation.actions';
import { first } from 'rxjs/operators';

@Component({
  selector: 'app-reserve',
  templateUrl: './reserve.page.html',
  styleUrls: ['./reserve.page.scss'],
})
export class ReservePage {
  @ViewChild(IonSearchbar) searchbar: IonSearchbar;
  title: String;
  searchProgramsMode: boolean;

  constructor(
    private store: Store<fromStore.AppState>,
    private reserveService: ReserveService,
    private navCtrl: NavController,
    private router: Router,
    private route: ActivatedRoute,
    public events: Events,
  ) {
    this.reserveService.titleEmitted$.subscribe(title => {
      this.title = title;
    });
  }

  goBack() {
    this.navCtrl.back();
  }

  onStartOver() {
    this.store.dispatch(new fromReservation.Start());
    this.router.navigate(['/tabs/reserve/locations'], { relativeTo: this.route });
  }

  showBack() {
    return this.router.url != '/tabs/reserve/locations';
  }

  disableRefresher() {
    return this.router.url === '/tabs/reserve/confirmation';
  }

  isProgramsPage() {
    return this.router.url.includes('programs');
  }

  openSearch() {
    this.searchProgramsMode = true;
  }

  closeSearch() {
    this.searchProgramsMode = false;
    this.reserveService.emitCloseSearch();
  }

  onSearch(e) {
    this.reserveService.emitSearch(e.detail.value);
  }

  doRefresh(event) {
    this.reserveService.emitRefresh();
    this.reserveService.refreshedEmitted$.pipe().subscribe(() => {
      event.target.complete();
    });
  }
}
