import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Store } from '@ngrx/store';
import * as fromStore from '../state/app.reducer';
import * as fromUser from '../state/user/user.actions';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
})
export class AuthPage implements OnInit {
  constructor(private storage: Storage, private store: Store<fromStore.AppState>) {}

  ngOnInit() {
    this.checkUser();
  }

  checkUser() {
    // TODO for now, check if cookie, if not, assume new user
    this.storage.get('userid').then(userId => {
      if (!userId) {
        // const id = uuid();
        // this.storage.set('userid', id);
        this.store.dispatch(new fromUser.Create());
      }
      this.store.dispatch(new fromUser.Get());
    });
  }
}
