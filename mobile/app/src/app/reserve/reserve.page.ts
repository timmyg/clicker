import { Component, ViewChild } from '@angular/core';
import { NavController, Events, IonSearchbar } from '@ionic/angular';
import { ReserveService } from './reserve.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-reserve',
  templateUrl: './reserve.page.html',
  styleUrls: ['./reserve.page.scss'],
})
export class ReservePage {
  @ViewChild(IonSearchbar) searchbar: IonSearchbar;
  title: String;
  searchMode: boolean;

  constructor(
    private reserveService: ReserveService,
    private navCtrl: NavController,
    private router: Router,
    public events: Events,
  ) {
    this.reserveService.titleEmitted$.subscribe(title => {
      this.title = title;
    });
    this.reserveService.closeSearchEmitted$.subscribe(x => {
      this.closeSearch();
    });
  }

  ngOnInit() {}

  ionViewDidLoad() {
    console.log('ionViewDidLoad');
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
    return this.router.url.includes('programs') || this.router.url.includes('locations');
  }

  openSearch() {
    this.searchMode = true;
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
