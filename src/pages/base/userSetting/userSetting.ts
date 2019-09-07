// 系统-- 用户设置
import { Component } from '@angular/core';
import { NavController, ActionSheetController, Config } from 'ionic-angular';
import { UserDetailPage } from '../userDetail/userDetail';
import { LoginPage } from '../login/login';
import { StatementPage } from '../statement/statement';
import { TranslateService } from '@ngx-translate/core';
import { FormControl } from '@angular/forms';
import { HttpService } from '../../../providers/http-service';
import { AboutPage } from '../about/about';
import { Storage } from '@ionic/storage';
import { Utils } from '../../../providers/utils';
import { HomePage } from '../home/home';
import { ChangePassPage } from '../changePass/changePass';
import { API_LOGOUT } from '../../../providers/api';

@Component({
	selector: 'page-userSetting',
	templateUrl: 'userSetting.html' 
})

export class UserSettingPage {

	showLang:boolean=false;
	langs:Array<{id:string, text:string}>;
	isOpenDoor:FormControl;
	msg:any;
	userIconUrl:string = 'assets/img/icon.png';
	userName:string;

	langTemp:string = 'zh';

	goBack() {
		if(this.langTemp == this.translate.currentLang) {
			this.navCtrl.pop();
		} else {
			this.navCtrl.setRoot(HomePage);
		}
	}

	logOut() {
		this.utils.message.loading('LOGIN_OUT_MSG');
		this.http.post(API_LOGOUT, {}, true).then(res => {
			this.utils.message.closeMessage();
			this.navCtrl.setRoot(LoginPage);
		}, err => {
			this.utils.message.closeMessage();
			this.navCtrl.setRoot(LoginPage);
		})
	}

	editUser() {
		this.utils.userCallback().then((u: { user: any, server: any }) => {
			if(u.user['loginType']==='NORMAL') {
				this.navCtrl.push(UserDetailPage, this);
			}
		}, err => {});
	}

	goToAbout() {
		this.navCtrl.push(AboutPage, this);
	}

	goToChange() {
		this.navCtrl.push(ChangePassPage, this);
	}

	goToStatement() {
		this.navCtrl.push(StatementPage, this);
	}

	changeLang(lang: {id:string,text:string}) {
		this.translate.use(lang.id);
		this.storage.set('LANG', lang.id);
		this.config.set('ios', 'backButtonText', '');
    	this.config.set('android', 'backButtonText', '');
    	this.navCtrl.getByIndex(0).instance.initLogo();
	}


	constructor(public navCtrl: NavController, public utils:Utils, public storage:Storage, public http:HttpService, public translate: TranslateService, public actionSheetCtrl: ActionSheetController, private config: Config) {
		this.langTemp = this.translate.currentLang;
		this.isOpenDoor = new FormControl();
		this.isOpenDoor.valueChanges.subscribe((val)=>{
			this.storage.set('OPEN_DOOR', val);
		});
		this.storage.get('OPEN_DOOR').then(v => {
			this.isOpenDoor.setValue(v ? true : false);
		})
		this.utils.userCallback().then((u: { user: any, server: any }) => {
			if(u.user['photopath']) {
				this.userIconUrl = this.utils.appendUrl(u.server['address'], u.user['photopath']);
			}
			this.userName = u.user.username;
		}, err => {});
		this.initLangs();
		this.initMsg();
	}

	setSelectLang(lang:string) {
		return this.translate.currentLang === lang ? 'action-sheet-selected' : '';
	}

	setSelectLangItem(opts, sitem) {
		opts.buttons.forEach((item) => {
			item.cssClass = item.value === sitem.id ? 'action-sheet-selected' : '';
		});
	}

	createLangOption() {
		this.translate.get(['COMMON_SURE']).subscribe(vals => {
			let opts = {buttons:[],cssClass:'base-code-sheet'};
			let selectItem = null;
			this.langs.forEach(item => {
				opts.buttons.push({
					text: this.msg[item.text],
					value: item.id,
					cssClass: this.setSelectLang(item.id),
					handler: () => {
						selectItem = item;
						this.setSelectLangItem(opts, item);
						return false;
						//this.changeLang(item);
						//this.initMsg();
					}
				});
			});
			opts.buttons.push({
				text: vals['COMMON_SURE'],
			    role: 'cancel',
		      	handler: () => {
		      		if(selectItem !== null) {
		      			this.changeLang(selectItem);
						this.initMsg();
		      		}
		        	return true;
		      	}
			});
			this.actionSheetCtrl.create(opts).present();
		});
		
	}

	initMsg() {
		let keys = [];
		this.langs.forEach(item => {
			keys.push(item.text);
		});
		this.translate.get(keys).subscribe(values => {
			this.msg = values;
		});
	}

	initLangs() {
		this.langs = [{
			id: 'zh',
			text: 'LANG_ZH'
		}, {
			id: 'en',
			text: 'LANG_EN'
		}, {
			id: 'es',
			text: 'LANG_ES'
		}, {
			id: 'id',
			text: 'LANG_ID'
		}]
	}
}