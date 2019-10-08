import { Component, OnInit, ViewChild } from '@angular/core';
import { ModalController, IonTextarea } from '@ionic/angular';
import * as fromApp from 'src/app/state/app/app.actions';
import * as fromStore from 'src/app/state/app.reducer';
import { Store } from '@ngrx/store';

@Component({
  selector: 'app-suggest',
  templateUrl: './suggest.component.html',
  styleUrls: ['./suggest.component.scss'],
})
export class SuggestComponent implements OnInit {
  @ViewChild('suggestionInput', { static: false }) suggestionInput: IonTextarea;
  suggestion: string;

  constructor(public modalController: ModalController, private store: Store<fromStore.AppState>) {}

  ngOnInit() {
    setTimeout(() => this.suggestionInput.setFocus(), 1000);
  }

  onCloseClick() {
    this.modalController.dismiss();
  }

  onSubmit() {
    console.log(this.suggestion);
    this.store.dispatch(new fromApp.SendMessage(this.suggestion));
    // this.actions$
    //   .pipe(ofType(fromReservation.CREATE_RESERVATION_SUCCESS, fromReservation.UPDATE_RESERVATION_SUCCESS))
    //   .pipe(first())
    //   .subscribe(() => {
    //   }
  }
}
