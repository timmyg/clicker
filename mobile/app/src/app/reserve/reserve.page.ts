import { Component, ViewChild, ViewEncapsulation } from "@angular/core";
import {
  NavController,
  Events,
  IonSearchbar,
  ModalController,
  Platform,
  ToastController
} from "@ionic/angular";
import { ReserveService } from "./reserve.service";
import { Router, NavigationEnd } from "@angular/router";
import { Observable, Subscription } from "rxjs";
import { WalletPage } from "../wallet/wallet.page";
import { first } from "rxjs/operators";
import { Deploy } from "cordova-plugin-ionic/dist/ngx";

@Component({
  selector: "app-reserve",
  templateUrl: "./reserve.page.html",
  styleUrls: ["./reserve.page.scss"],
  encapsulation: ViewEncapsulation.None
})
export class ReservePage {
  @ViewChild("searchbar", { static: false }) searchbar: IonSearchbar;
  title: String;
  searchMode: boolean;
  showingLocations: boolean;
  tokenCount$: Observable<number>;
  percentageComplete: number;
  walletModal;
  sub: Subscription;
  pageSub: Subscription;
  routerListerSub: Subscription;
  channelsClick = 0;

  constructor(
    public reserveService: ReserveService,
    private navCtrl: NavController,
    private router: Router,
    private platform: Platform,
    public events: Events,
    public modalController: ModalController,
    private walletPage: WalletPage,
    public toastController: ToastController,
    private deploy: Deploy
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

  ngOnInit() {
    this.pageSub = this.platform.backButton.subscribe(() => {
      console.log("page back");
      this.goBack();
    });
  }
  ngOnDestroy() {
    if (this.sub) this.sub.unsubscribe();
    if (this.pageSub) this.pageSub.unsubscribe();
  }

  goBack() {
    this.navCtrl.back();
  }

  showBack() {
    return this.router.url != "/tabs/reserve/locations";
  }

  disableRefresher() {
    return this.router.url.includes("/tabs/reserve/confirmation");
  }

  initStepListener() {
    this.routerListerSub = this.router.events.subscribe(e => {
      if (e instanceof NavigationEnd) {
        switch (e.url.split("?")[0]) {
          case "/":
          case "/tabs/reserve":
          case "/tabs/reserve/locations":
            this.percentageComplete = 0.125;
            break;
          case "/tabs/reserve/programs":
            this.percentageComplete = 0.375;
            break;
          case "/tabs/reserve/tvs":
            this.percentageComplete = 0.625;
            break;
          case "/tabs/reserve/confirmation":
            this.percentageComplete = 0.875;
            break;
        }
      }
    });
  }

  async onCoinsClick() {
    this.walletModal = await this.modalController.create({
      component: WalletPage
    });
    this.sub = this.platform.backButton.pipe(first()).subscribe(() => {
      if (this.walletModal) this.walletModal.close();
    });
    return await this.walletModal.present();
  }

  isSearchablePage() {
    return (
      this.router.url.includes("programs") ||
      (this.router.url.includes("locations") && this.showingLocations)
    );
  }

  isStepActive(stepName: string) {
    switch (stepName) {
      case "location":
        return this.router.url.includes("locations");
      case "channel":
        return this.router.url.includes("programs");
      case "tv":
        return this.router.url.includes("tvs");
      case "confirm":
        return this.router.url.includes("confirmation");
    }
  }

  isStepComplete(stepName: string) {
    switch (stepName) {
      case "location":
        return !this.router.url.includes("locations");
      case "channel":
        return (
          !this.router.url.includes("locations") &&
          !this.router.url.includes("programs")
        );
      case "tv":
        return (
          !this.router.url.includes("locations") &&
          !this.router.url.includes("programs") &&
          !this.router.url.includes("tvs")
        );
      case "confirm":
        return false;
    }
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

  async toggleChannel() {
    this.channelsClick++;
    console.log(this.channelsClick);
    if (this.channelsClick === 7) {
      if (!this.platform.is("capacitor")) {
        return this.showToast(`capacitor only`);
      }
      const channel = "Master";
      await this.deploy.configure({ channel });
      await this.deploy.sync({ updateMethod: "auto" });
      this.showToast(`🕵️‍♀ switch to channel: ${channel}`);
    } else if (this.channelsClick === 14) {
      const channel = "Develop";
      await this.deploy.configure({ channel });
      await this.deploy.sync({ updateMethod: "auto" });
      this.showToast(`🕵️‍♀ switch to channel: ${channel}`);
    } else if (this.channelsClick === 21) {
      const channel = "Production";
      await this.deploy.configure({ channel });
      await this.deploy.sync({ updateMethod: "auto" });
      this.showToast(`🕵️‍♀ switch to channel: ${channel}`);
      this.channelsClick = 0;
    }
  }

  async showToast(message: string) {
    const toast = await this.toastController.create({
      message,
      cssClass: "ion-text-center",
      duration: 3000
    });
    toast.present();
  }
}
