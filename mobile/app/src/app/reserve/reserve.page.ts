import { Component, OnInit, ViewChild } from '@angular/core';
import { NavController, Events, IonSearchbar } from '@ionic/angular';
import { ReserveService } from './reserve.service';
import { Router, ActivatedRoute } from '@angular/router';
import { Store } from '@ngrx/store';
import * as fromStore from '../state/app.reducer';
import * as fromReservation from '../state/reservation/reservation.actions';

@Component({
  selector: 'app-reserve',
  templateUrl: './reserve.page.html',
  styleUrls: ['./reserve.page.scss'],
})
export class ReservePage implements OnInit {
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

  // 1. location
  // 2. channel
  // 3. tv

  // ngOnInit() {
  //   // this.store.dispatch(new fromReservation.Start());
  //   console.log(this.route.snapshot);
  // }

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

  // showStartOver() {
  //   return this.router.url != '/tabs/reserve/locations';
  // }

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
}
