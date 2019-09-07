// 人事-- 新增
import { Component } from '@angular/core';
import { NavController, NavParams, ActionSheetController,Keyboard, IonicApp } from 'ionic-angular';
import { FormGroup, Validators, AbstractControl } from '@angular/forms';
import { PersListPage } from '../persList/persList';
import { PersPhotoPage } from '../persPhoto/persPhoto';
import { HttpService } from '../../../providers/http-service';
import { PersSelectDeptPage } from "../persSelectDept/persSelectDept";
import { Utils } from '../../../providers/utils';
import { Properties } from '../../../providers/properties';
import { CommonValidator } from '../../../providers/common-validator';
import { CallNumber } from '@ionic-native/call-number';
import { SMS, SmsOptions } from '@ionic-native/sms';
import { API_PERS_GET, API_PERS_ADD, API_PERS_DEPT, API_PERS_EDIT } from '../../../providers/api';

@Component({
	selector: 'page-persAdd',
	templateUrl: 'persAdd.html' 
})

export class PersAddPage {

	genderText:string;

	persForm: FormGroup;
	pageTitle: string;
	photoImg:string='assets/img/icon.png';
	isEditPage:boolean;
	pinSupport:boolean;
	cardHex:boolean = true;
	hasAcc:boolean=true;
	msg:any = {};
	lang:string = 'zh';
	serverLang:string;

	url:any = API_PERS_ADD;

	goToPhotoPage() {
		if(!this.persForm.controls['mobile'].value) {
			this.utils.message.error('REG_MSG_MOBILE_IN');
			return;
		}
		this.navCtrl.push(PersPhotoPage, this)
	}

	/**
	 * 自定义人员编号验证方法
	 * @type {Function}
	 */
	pinValidator = (control: AbstractControl): {[key: string]: boolean}  => {
		if(control.value) {
			if(this.pinSupport) {
				if(!/^[A-Za-z0-9]+$/.test(control.value)) {
					this.msg['pin'] = 'PERS_ERR_MSG3';
					return {nomatch:true};
				}
			} else {
				if(!/^[0-9]+$/.test(control.value)) {
					this.msg['pin'] = 'PERS_ERR_MSG4';
					return {nomatch:true};
				}
			}
		} else {
			this.msg['pin'] = 'PERS_ERR_MSG1';
			return {nomatch:true};
		}
		return null;
	}

	callPhone() {
		if(this.persForm.value.mobile){
			this.callNumber.callNumber(this.persForm.value.mobile, true).then(() => {}).catch(() => {})
		} else {
			this.utils.message.error('PERS_ERR_MSG13');
		}
		
	}

	callMessage() {
		if(this.persForm.value.mobile){
			let options = {
				android: {
					intent: 'INTENT'
				}
			} as SmsOptions;
			this.sms.send(this.persForm.value.mobile, '', options);
		} else {
			this.utils.message.error('PERS_ERR_MSG13');
		}

	}

	/**
	 * 自定义手机号验证方法
	 * @type {Function}
	 */
	phoneValidator = (control: AbstractControl): {[key: string]: boolean} => {
		if(control.value) {
			if(this.serverLang === 'zh_CN') {
				return Validators.pattern(/^1[3|4|5|8][0-9]\d{4,8}$/)(control);
			} else {
				return Validators.pattern(/^((\+27)|(0027)|(0))[1-9]\d{8}$/)(control);
			}
		}
		return null;
	}


	nameValidator = (control: AbstractControl): {[key: string]: boolean} => {
		if(control.value) {
			if(/[&<>`~!@#$%^*?/|\\:;="]/.test(control.value)) {
				this.msg['name'] = 'PERS_ERR_MSG10';
				this.msg['lastName'] = 'PERS_ERR_MSG10';
				return {nomatch:true};
			}
		}
		return null;
	}

	/**
	 * 自定义卡号验证方法
	 * @type {Function}
	 */
	cardValidator = (control: AbstractControl): {[key: string]: boolean} => {
		if(control.value) {
			if(this.cardHex) {
				if(!/^[0-9]+$/.test(control.value)) {
					this.msg['cardNos'] = 'PERS_ERR_MSG5';
					return {nomatch:true};
				}
			} else {
				if(!/^[A-Fa-f0-9]+$/.test(control.value)) {
					this.msg['cardNos'] = 'PERS_ERR_MSG6';
					return {nomatch:true};
				}
			}
		}
		return null;
	}

	initDefaultDept() {
		this.http.get(API_PERS_DEPT, {appId:this.http.appId}, true).then(res => {
			if(res['ret'] === this.http.success) {
				for(let i = 0; i < res['data'].length; i++) {
					if(res['data'][i].selected === 'true') {
						this.persForm.controls['deptName'].setValue(res['data'][i].text);
						this.persForm.controls['deptCode'].setValue(res['data'][i].code);
						break;
					}
				}
			}
		}, err => {})
	}
	
	/**
	 * 初始化表单
	 * @return {[type]} [description]
	 */
	initForm() {
		this.persForm = this.cv.validate({rules: {
				name: ['', this.nameValidator],
				lastName: ['', this.nameValidator],
				pin: ['', this.pinValidator],
				gender: [''],
				deptName: ['', Validators.required],
				deptCode: ['', Validators.required],
				mobile: [''],
				email: [''],
				cardNos: ['', this.cardValidator],
				avatarUrl: [''],
				cropUrl: [''],
				resetPassword:[false],
				customerId:[''],
				appId:[this.http.appId],
				enabled:[false]
			}, message: this.msg, 
			noStatusChange:true
		});

		this.persForm.controls['avatarUrl'].valueChanges.subscribe(v => {
			if(v) {
				this.photoImg = v;
			} else {
				this.photoImg = 'assets/img/icon.png';
			}
		});

		this.persForm.controls['gender'].valueChanges.subscribe(v => {
			if(v) {
				this.genderText = v === 'F' ? 'PERS_FEMALE' : 'PERS_MALE';

			} else {
				this.genderText = '';
			}
		});

		this.initPersonInfo();
	}

	setOptionClass(opts, ind) {
		opts.buttons.forEach((item, index) => {
			item.cssClass = index === ind ? 'action-sheet-selected' : '';
		});
	}

	setGender() {
		if(this.keyboard.isOpen()) {
			//return;
		}
		this.utils.translate.get(['PERS_GENDER', 'PERS_FEMALE', 'PERS_MALE', 'COMMON_SURE']).subscribe(vals => {
			let opts = {
				cssClass: 'base-code-sheet',
			    title: vals['PERS_GENDER'],
			    buttons: [{
			      	text: vals['PERS_FEMALE'],
			      	cssClass: this.genderText === 'PERS_FEMALE' ? 'action-sheet-selected' : '',
			      	handler: () => {
			      		this.persForm.controls['gender'].setValue('F');
			      		this.setOptionClass(opts, 0);
			      		return false;
			      	}
			    }, {
			    	text: vals['PERS_MALE'],
			      	cssClass: this.genderText === 'PERS_MALE' ? 'action-sheet-selected' : '',
			      	handler: () => {
			      		this.persForm.controls['gender'].setValue('M');
			      		this.setOptionClass(opts, 1);
			      		return false;
			      	}
			    }, {
			    	text: vals['COMMON_SURE'],
			      	role: 'cancel',
			      	handler: () => {
			        	return true;
			      	}
			    }]
			};
			this.asCtrl.create(opts).present();
		});
	}

	/**
	 * 初始化人员数据
	 * @return {[type]} [description]
	 */
	initPersonInfo() {
		//判断新增还是编辑
		if(this.navParams.data.pin) {
			this.pageTitle = 'PERS_DETAIL';
			this.url = API_PERS_EDIT;
			this.isEditPage = true;
			this.http.get(API_PERS_GET, {customerId: this.navParams.data.customerId}, true).then(res => {
				if(res['ret'] === this.http.success) {
					this.persForm.controls['name'].setValue(res['data']['name']); 
					this.persForm.controls['lastName'].setValue(res['data']['lastName']);
					this.persForm.controls['pin'].setValue(res['data']['pin']);
					this.persForm.controls['gender'].setValue(res['data']['gender']);
					this.persForm.controls['resetPassword'].setValue(res['data']['resetPassword']);
					this.persForm.controls['deptName'].setValue(this.navParams.data.deptName);
					this.persForm.controls['deptCode'].setValue(this.navParams.data.deptCode);
					this.persForm.controls['mobile'].setValue(res['data']['mobile']);
					this.persForm.controls['email'].setValue(res['data']['email']);
					this.persForm.controls['cardNos'].setValue(res['data']['cardNos']);
					this.persForm.controls['enabled'].setValue(res['data']['enabled']);
					this.persForm.controls['avatarUrl'].setValue(res['data']['avatarUrl']);
					this.persForm.controls['cropUrl'].setValue(res['data']['cropUrl']);
					this.persForm.controls['customerId'].setValue(res['data']['customerId']);
				}else {
					this.utils.message.error(res['msg'])
				}
			}, err => {})
			
		} else {

			/* this.http.post(API_PERS_PIN,{}, true).then(res => {
				if(res['ret'] === 'OK') {
					this.persForm.controls['pin'].setValue(res['data']['pin']);
				}
			}, err => {}); */
			this.initDefaultDept();
			this.pageTitle = 'PAGE_PERSADD';
			this.url = API_PERS_ADD;
			this.isEditPage = false;
		}
	}

	/**
	 * 选择部门
	 * @return {[type]} 
	 */
	selectDepartment() {
    	this.navCtrl.push(PersSelectDeptPage, this);
  	}
	
	save() {
		if(!this.cv.valid(this.persForm)) {
			return;
		}
		/* if(this.persForm.value.password.length != 32) {//非MD5字符串
			this.persForm.value.password = Md5.hashStr(this.persForm.value.password);
		} */
		this.http.post(this.url,this.persForm.value, false, 60000).then(resp => {
			if(resp['ret'] === this.http.success) {
				this.utils.message.success('COMMON_SAVE_SUCCESS');
				setTimeout(() => {
					if(this.navCtrl.length() === 3) {
						this.navCtrl.getByIndex(1).instance.query().then(resp=>{}, err=>{});
						this.navCtrl.pop();
					} else {
						this.utils.message.closeMessage();
						this.navCtrl.pop();
						this.navCtrl.push(PersListPage);
					}
				},1000);
				
			} else {
				this.utils.message.error(resp['msg']|| resp['ret'])
			}
		}, err => {
			this.utils.message.error('COMMON_SAVE_FAILED');
		});
	}

	constructor(public cv:CommonValidator, public sms: SMS, public callNumber: CallNumber, public keyboard:Keyboard, public asCtrl:ActionSheetController, public props:Properties,public app:IonicApp, public utils:Utils, public navCtrl: NavController, public navParams: NavParams, public http: HttpService) {
		this.msg = {
			pin: 'PERS_ERR_MSG1',
			deptCode:'PERS_ERR_MSG2',
			cardNos:'',
			personPwd:'PERS_ERR_MSG7',
			mobilePhone: 'PERS_ERR_MSG12'
		};
		this.lang = this.utils.translate.currentLang;
		this.initForm();
		/* this.props.getPropertise(['pers.pinSupportLetter', 'pers.cardHex', 'system.language', 'acc.version']).then(val => {
			if(val) {
				this.pinSupport = val['pers.pinSupportLetter'] === 'true' ? true : false;
				this.cardHex = val['pers.cardHex'] === '0' ? true : false;
				this.serverLang = val['system.language'] || 'zh_CN';
				if(val['acc.version']) {
					this.hasAcc = true;
				} else {
					this.hasAcc = false;
				}
			}
		}) */
	}

}