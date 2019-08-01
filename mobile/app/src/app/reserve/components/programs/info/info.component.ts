import { Component, Input } from '@angular/core';
import { Program } from 'src/app/state/program/program.model';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-info',
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.scss'],
})
export class InfoComponent {
  @Input() program: Program;

  constructor(private modalController: ModalController) {}

  onCloseClick() {
    this.modalController.dismiss();
  }
  x;
}
