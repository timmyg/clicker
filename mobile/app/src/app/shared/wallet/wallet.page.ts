import { Component, Input, EventEmitter, Output } from '@angular/core';
import { faCopyright, faCreditCard } from '@fortawesome/free-regular-svg-icons';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { faCcApplePay } from '@fortawesome/free-brands-svg-icons';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.page.html',
  styleUrls: ['./wallet.page.scss'],
})
export class WalletPage {
  @Input() monies: number;
  @Output() onClose = new EventEmitter();
  faCopyright = faCopyright;
  faTimes = faTimes;
  faCreditCard = faCreditCard;
  faCcApplePay = faCcApplePay;

  constructor(public modalController: ModalController) {}

  onCloseClick() {
    this.modalController.dismiss();
  }
}
