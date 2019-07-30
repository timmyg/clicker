import { Component, ViewChild, ViewEncapsulation, OnInit } from '@angular/core';
import { NavController, Events, IonSearchbar, ModalController } from '@ionic/angular';
import { ReserveService } from './reserve.service';
import { Router, NavigationEnd } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { WalletPage } from '../wallet/wallet.page';

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
  percentageComplete: number;
  walletModal;
  routerListerSub: Subscription;

  constructor(
    public reserveService: ReserveService,
    private navCtrl: NavController,
    private router: Router,
    public events: Events,
    public modalController: ModalController,
    private walletPage: WalletPage,
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
    this.tokenCount$ = this.walletPage.getCoinCount();
    this.initStepListener();
  }

  goBack() {
    this.navCtrl.back();
  }

  showBack() {
    return this.router.url != '/tabs/reserve/locations';
  }

  disableRefresher() {
    return this.router.url.includes('/tabs/reserve/confirmation');
  }

  initStepListener() {
    this.routerListerSub = this.router.events.subscribe(e => {
      if (e instanceof NavigationEnd) {
        switch (e.url.split('?')[0]) {
          case '/':
          case '/tabs/reserve':
          case '/tabs/reserve/locations':
            this.percentageComplete = 0.125;
            break;
          case '/tabs/reserve/programs':
            this.percentageComplete = 0.375;
            break;
          case '/tabs/reserve/tvs':
            this.percentageComplete = 0.625;
            break;
          case '/tabs/reserve/confirmation':
            this.percentageComplete = 0.875;
            break;
        }
      }
    });
  }

  async onCoinsClick() {
    this.walletModal = await this.modalController.create({
      component: WalletPage,
    });
    return await this.walletModal.present();
  }

  isSearchablePage() {
    return this.router.url.includes('programs') || (this.router.url.includes('locations') && this.showingLocations);
  }

  isStepActive(stepName: string) {
    switch (stepName) {
      case 'location':
        return this.router.url.includes('locations');
      case 'channel':
        return this.router.url.includes('programs');
      case 'tv':
        return this.router.url.includes('tvs');
      case 'confirm':
        return this.router.url.includes('confirmation');
    }
  }

  isStepComplete(stepName: string) {
    switch (stepName) {
      case 'location':
        return !this.router.url.includes('locations');
      case 'channel':
        return !this.router.url.includes('locations') && !this.router.url.includes('programs');
      case 'tv':
        return (
          !this.router.url.includes('locations') &&
          !this.router.url.includes('programs') &&
          !this.router.url.includes('tvs')
        );
      case 'confirm':
        return false;
    }
  }

  toggleSearch() {
    this.searchMode = !this.searchMode;
    setTimeout(() => this.searchbar.setFocus(), 100);
  }

  getProgressPercentage(stepName) {
    switch (stepName) {
      case 'location':
        return 0.2;
      case 'channel':
        return 0.4;
      case 'tv':
        return 0.6;
      case 'confirm':
        return 0.8;
    }
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
