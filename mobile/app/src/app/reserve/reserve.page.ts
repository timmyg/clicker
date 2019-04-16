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

  ngOnInit() {
    // TODO load from reservationId if passed in and navigate accordingly
    // console.log('oninit', this.router.url);
    console.log('reserve component init');
    this.store.dispatch(new fromReservation.Start());
    console.log('navigate to locatoins');
    this.router.navigate(['/tabs/reserve/locations']);
  }

  ngOnDestroy(): void {
    console.log('ondestroy');
  }

  async ionViewDidEnter() {
    console.log('ionViewDidEnter');
    this.ngOnInit();
    //   const state = await this.store.pipe(first()).toPromise();
    //   const reservation: Partial<Reservation> = state.reservation.reservation;
    //   // console.log(reservation);
    //   if (reservation.hasLocation()) {
    //     if (reservation.hasTV()) {
    //       // console.log('go to confirmation');
    //       this.router.navigate(['./confirmation'], { relativeTo: this.route });
    //     } else if (reservation.hasChannel()) {
    //       // console.log('go to tv');
    //       this.router.navigate(['./tvs'], { relativeTo: this.route });
    //     } else {
    //       console.log('go to channel');
    //       this.navCtrl.navigateForward(['./programs'], { relativeTo: this.route });
    //     }
    //   } else {
    //     console.log('no location', this.router.url);
    //     this.navCtrl.navigateForward(['./locations'], { relativeTo: this.route });
    //   }
  }

  goBack() {
    this.navCtrl.back();
  }

  showBack() {
    return this.router.url != '/tabs/reserve/locations';
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
}
