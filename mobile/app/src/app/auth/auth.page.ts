import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';
import { v1 as uuid } from 'uuid';

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
      if (!userId) {
        this.storage.set('userid', uuid());
      }
    });
  }
}
