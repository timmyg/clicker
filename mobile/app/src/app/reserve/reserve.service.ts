import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ReserveService {
  // Observable string sources
  private emitTitleSource = new Subject<any>();
  // Observable string streams
  titleEmitted$ = this.emitTitleSource.asObservable();
  // Service message commands
  emitTitle(title: any) {
    console.log(title);
    this.emitTitleSource.next(title);
  }
}
