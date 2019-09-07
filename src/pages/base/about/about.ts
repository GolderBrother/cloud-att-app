// ϵͳ����-- ����
import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';

@Component({
	selector: 'page-about',
	templateUrl: 'about.html' 
})

export class AboutPage {
	logoSrc:string;
	isLocal:boolean;
	currentYear:string = '';
	constructor(public navCtrl: NavController, public translate:TranslateService) {
		if(this.translate.currentLang === 'zh') {
			this.logoSrc = 'assets/img/cn_logo.png';
			this.isLocal = true;
		} else {
			this.logoSrc = 'assets/img/en_logo.png';
			this.isLocal = false;
		}
		this.currentYear = new Date().getFullYear().toString();
	}
}