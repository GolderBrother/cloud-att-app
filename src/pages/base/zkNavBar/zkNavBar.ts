// ϵͳ����-- ������
import { Component, Input } from '@angular/core';
import { NavController } from 'ionic-angular';

@Component({
	selector: 'zk-nav-bar',
	templateUrl: 'zkNavBar.html' 
})

export class ZkNavBar {

	@Input() titleMsg:string;
	@Input() hideBackButton:boolean;

	constructor(public navCtrl: NavController) {
		
	}
}