import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { AttApplyInfoPage } from '../attApplyInfo/attApplyInfo';

//我的申请
@Component({
    selector: "page-attApply",
    templateUrl: "attApply.html"
})
export class AttApplyPage {

    goAttSignCard(): void {
        this.navCtrl.push(AttApplyInfoPage, '0');
    }
    goAttLeaveApply(): void {
        this.navCtrl.push(AttApplyInfoPage, '1');
    }
    constructor(public navCtrl: NavController) {

    }
}
