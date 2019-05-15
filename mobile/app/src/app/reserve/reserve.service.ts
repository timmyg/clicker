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

  emitTitle(title: any) {
    this.emitTitleSource.next(title);
  }

  emitSearch(term: string) {
    this.emitSearchTermSource.next(term);
  }

  emitCloseSearch() {
    this.emitCloseSearchSource.next();
  }

  emitRefresh() {
    this.emitRefreshSource.next();
  }

  emitRefreshed() {
    this.emitRefreshedSource.next();
  }
}
