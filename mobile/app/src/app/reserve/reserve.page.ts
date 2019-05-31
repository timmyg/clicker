import { Component, ViewChild, ViewEncapsulation } from '@angular/core';
import { NavController, Events, IonSearchbar } from '@ionic/angular';
import { ReserveService } from './reserve.service';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import * as fromStore from '../state/app.reducer';
import { getUserTokenCount } from '../state/user';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-reserve',
  templateUrl: './reserve.page.html',
  styleUrls: ['./reserve.page.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ReservePage {
  @ViewChild('searchbar') searchbar: IonSearchbar;
  title: String;
  searchMode: boolean;
  showingLocations: boolean;
  tokenCount$: Observable<number>;

  constructor(
    private store: Store<fromStore.AppState>,
    public reserveService: ReserveService,
    private navCtrl: NavController,
    private router: Router,
    public events: Events,
  ) {
    this.reserveService.titleEmitted$.subscribe(title => {
      this.title = title;
    });
    this.reserveService.closeSearchEmitted$.subscribe(() => {
      this.closeSearch();
    });
    this.reserveService.showingLocationsEmitted$.subscribe(() => {
      this.showingLocations = true;
    });
    this.tokenCount$ = this.store.select(getUserTokenCount);
  }

  goBack() {
    this.navCtrl.back();
  }

  showBack() {
    return this.router.url != '/tabs/reserve/locations';
  }

  disableRefresher() {
    return this.router.url === '/tabs/reserve/confirmation';
  }

  isSearchablePage() {
    return this.router.url.includes('programs') || (this.router.url.includes('locations') && this.showingLocations);
  }

  toggleSearch() {
    this.searchMode = !this.searchMode;
    setTimeout(() => this.searchbar.setFocus(), 100);
  }

  closeSearch() {
    this.searchMode = false;
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
