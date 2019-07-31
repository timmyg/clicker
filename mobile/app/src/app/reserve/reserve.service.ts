import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ReserveService {
  private emitTitleSource = new Subject<any>();
  titleEmitted$ = this.emitTitleSource.asObservable();
  private emitSearchTermSource = new Subject<any>();
  searchTermEmitted$ = this.emitSearchTermSource.asObservable();
  private emitCloseSearchSource = new Subject<any>();
  closeSearchEmitted$ = this.emitCloseSearchSource.asObservable();

  private emitRefreshSource = new Subject<any>();
  refreshEmitted$ = this.emitRefreshSource.asObservable();
  private emitRefreshedSource = new Subject<any>();
  refreshedEmitted$ = this.emitRefreshedSource.asObservable();

  private emitShowingLocationsSource = new Subject<boolean>();
  showingLocationsEmitted$ = this.emitShowingLocationsSource.asObservable();

  private emitToggleHiddenLocationsSource = new Subject<boolean>();
  showingHiddenLocationsEmitted$ = this.emitToggleHiddenLocationsSource.asObservable();

  public isRefreshing: boolean;

  hiddenClicks = 0;

  emitTitle(title: any) {
    this.emitTitleSource.next(title);
  }

  emitSearch(term: string) {
    this.emitSearchTermSource.next(term);
  }

  emitCloseSearch() {
    this.emitCloseSearchSource.next();
  }

  emitShowingLocations() {
    this.emitShowingLocationsSource.next();
  }

  emitRefresh() {
    this.emitRefreshSource.next();
    this.isRefreshing = true;
  }

  emitRefreshed() {
    this.emitRefreshedSource.next();
    this.isRefreshing = false;
  }

  toggleHiddenLocations() {
    this.hiddenClicks++;
    if (this.hiddenClicks >= 7) {
      this.emitToggleHiddenLocationsSource.next();
      this.hiddenClicks = 0;
    }
  }
}
