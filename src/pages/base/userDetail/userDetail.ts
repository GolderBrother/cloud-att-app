// 系统-- 编辑用户
import { Component } from '@angular/core';
import { NavController, NavParams} from 'ionic-angular';
import { FormBuilder, Validators, FormGroup, AbstractControl } from '@angular/forms';
import { HttpService } from '../../../providers/http-service';
import { Storage } from '@ionic/storage';
import { CommonValidator } from '../../../providers/common-validator';


@Component({
	selector: 'page-userDetail',
	templateUrl: 'userDetail.html' 
})
export class UserDetailPage {

	user:any={};
	form: FormGroup;

	pswChecker(control: AbstractControl): {[key: string]: boolean} {
		
		if(control.root.value.resetPsw) { 
			if(control.root.value.password !== control.value) {
				return {nomatch:true};
			}
		}
		return null;
	}

	pswRequire(control: AbstractControl): {[key: string]: boolean} {
		if(control.value) {
			if(control.root.value.password === '' || control.root.value.checkpsw === '') {
				return {nomatch:true};
			}
		}
		return null;
	}

	emailChecker(control: AbstractControl): {[key: string]: boolean} {
		if(control.value) {
			return Validators.email(control);
		}
		return null;
	}

	initForm() {
		this.form = this.cv.validate({
			rules: {
				username: [''],
				password: ['', Validators.pattern(/^[A-Za-z0-9]{4,18}$/)],
				checkpsw: ['',  this.pswChecker],
				resetPsw: [false, this.pswRequire],
				name: [''],
				email: ['', this.emailChecker]
			},
			message: {
				checkpsw: 'USER_ERR_MSG1',
				password: 'USER_ERR_MSG3',
				email: 'USER_ERR_MSG2',
				resetPsw: 'USER_ERR_MSG4'
			},
			noStatusChange:true//关闭状态变更触发提示
		})
		this.form.controls['resetPsw'].valueChanges.subscribe(v => {
			if(!v) {
				this.form.controls['password'].setValue('');
				this.form.controls['checkpsw'].setValue('');
			}
		})
	}

	constructor(public navCtrl: NavController, public storage: Storage, public cv:CommonValidator, public navParams: NavParams, public http:HttpService, formBuilder: FormBuilder) {
		this.initForm();
		this.queryUser();
	}

	queryUser() {
		this.storage.get('USER').then(val => {
			if(val) {
				this.form.controls['username'].setValue(val.username || '');
				this.http.post('app/v1/getAppUser', {username:val.username}).then(resp => {
					if(resp['ret'] === 'OK') {
						this.form.controls['name'].setValue(resp['data']['name'] || '');
						this.form.controls['email'].setValue(resp['data']['email'] || '');
					}
				}, err => {});
			}
		})
	}

	doSubtmit() {
		if (!this.cv.valid(this.form)) {
			return;
		}
		this.http.post('app/v1/editAppUser', this.form.value).then(resp => {
			if(resp['ret'] === 'OK') {
				this.navCtrl.pop();
			}
		}, err => {})
	}
}