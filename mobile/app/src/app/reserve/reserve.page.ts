import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { NavController } from '@ionic/angular';
import { ReserveService } from './reserve.service';

@Component({
  selector: 'app-reserve',
  templateUrl: './reserve.page.html',
  styleUrls: ['./reserve.page.scss'],
})
export class ReservePage {
  title: String;

  constructor(private navCtrl: NavController, private reserveService: ReserveService) {
    this.reserveService.titleEmitted$.subscribe(title => {
      this.title = title;
    });
  }

  goBack() {
    this.navCtrl.back();
  }
}
