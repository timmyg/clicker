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

  emitTitle(title: any) {
    this.emitTitleSource.next(title);
  }

  emitSearch(term: string) {
    this.emitSearchTermSource.next(term);
  }
}
