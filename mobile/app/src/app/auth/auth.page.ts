import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';
import { Store } from '@ngrx/store';
import { v1 as uuid } from 'uuid';
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
        this.storage.set('userid', uuid());
      }
      this.store.dispatch(new fromUser.Get());
    });
  }
}
