import { Component, OnInit } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.page.html',
  styleUrls: ['./auth.page.scss'],
  // providers: [AuthService],
})
export class AuthPage implements OnInit {
  constructor(public auth: AuthService) {}

  ngOnInit() {}
}
