import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.page.html',
  styleUrls: ['./wallet.page.scss'],
})
export class WalletPage implements OnInit {
  @Input() monies: number;

  constructor() {}

  ngOnInit() {}
}
