import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';
const uuid = require('uuid/v1');

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
})
export class AuthPage implements OnInit {
  constructor(private storage: Storage) {}

  ngOnInit() {
    this.checkUser();
  }

  checkUser() {
    // TODO for now, check if cookie, if not, assume new user
    this.storage.get('userid').then(userId => {
      console.log({ userId });
      if (!userId) {
        this.storage.set('userid', uuid());
      }
    });
  }
}
