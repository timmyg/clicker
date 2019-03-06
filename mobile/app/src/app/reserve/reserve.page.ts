import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { NavController } from '@ionic/angular';
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
  title: String;

  constructor(
    private store: Store<fromStore.AppState>,
    private reserveService: ReserveService,
    private navCtrl: NavController,
    private router: Router,
    private route: ActivatedRoute,
  ) {
    this.reserveService.titleEmitted$.subscribe(title => {
      this.title = title;
    });
  }

  ngOnInit() {
    // TODO load from reservationId if passed in and navigate accordingly
    this.store.dispatch(new fromReservation.Start());
    this.router.navigate(['./locations'], { relativeTo: this.route });
  }

  goBack() {
    this.navCtrl.back();
  }
}
