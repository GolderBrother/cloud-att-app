import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Validators, FormGroup, AbstractControl } from '@angular/forms';
import { CommonValidator } from '../../../providers/common-validator';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { Utils } from '../../../providers/utils';
import { HttpService } from '../../../providers/http-service';
import { API_COMP_GET, API_CODE_GET, API_RESET_PSW } from '../../../providers/api';
import { Md5 } from 'ts-md5/dist/md5';

@Component({
	selector: "page-forget",
	templateUrl: "forget.html"
})
export class ForgetPage {

	form: FormGroup;

	codeScan() {
		this.barcodeScanner.scan().then(data => {
			this.http.get(API_COMP_GET, { appId: data.text }, true).then(res => {
				if (res['ret'] == this.http.success) {
					this.form.controls['appId'].setValue(data.text);
					this.form.controls['compName'].setValue(res['data']['companyName']);
				} else {
					this.utils.message.error('REG_MSG_COMP');
				}
			}, err => {
				this.utils.message.error('REG_MSG_COMP');
			})
		})
	}

	getCheckCode(e: any) {
		if (!this.form.value.appId) {
			this.utils.message.error('REG_MSG_APPID');
			return;
		} else if (!this.form.value.phone) {
			this.utils.message.error('LOGIN_ERR_MSG1');
			return;
		}
		this.http.post(API_CODE_GET, { appId: this.form.value.appId, phone: this.form.value.phone }).then(res => {
			if (res['ret'] == this.http.success) {
				this.utils.message.success(this.form.value.phone.indexOf('@') == -1 ? 'FOR_MSG_CODE1' : 'FOR_MSG_CODE');
			} else {
				this.utils.message.error(res['msg'] || 'FOR_MSG_FAIL');
			}
		}, err => {
			this.utils.message.error('FOR_MSG_FAIL');
		})
	}

	pswChecker(control: AbstractControl): { [key: string]: boolean } {
		if (control.root.value.newPassword !== control.value) {
			return { nomatch: true };
		}
		return null;
	}

	initForm() {
		//通过cv创建表单验证
		this.form = this.cv.validate({
			rules: {//校验规则
				checkPassword: ['', this.pswChecker],
				newPassword: ['', Validators.required],
				compName: [''],
				phone: ['', Validators.required],
				appId: ['', Validators.required],
				verificationCode: ['']
			},
			message: {//提示消息
				phone: 'LOGIN_ERR_MSG1',
				checkPassword: "USER_ERR_MSG1",
				appId: 'REG_MSG_APPID',
				newPassword: "LOGIN_ERR_MSG2"
			},
			noStatusChange: true//关闭状态变更触发提示
		});
	}

	doForget() {
		if (!this.cv.valid(this.form)) {
			return;
		}
		let params = JSON.parse(JSON.stringify(this.form.value));
		params.newPassword = Md5.hashStr(this.form.value.newPassword);
		this.http.post(API_RESET_PSW, params).then(res => {
			if (res['ret'] == this.http.success) {
				this.utils.message.success('COMMON_OP_SUCCESS');
				setTimeout(() => {
					this.navCtrl.pop();
				}, 2000);
			} else {
				this.utils.message.error(res['msg'] || 'COMMON_OP_FAILED');
			}
		}, err => {
			this.utils.message.error('COMMON_OP_FAILED');
		})
	}

	constructor(public navCtrl: NavController, public cv: CommonValidator, public barcodeScanner: BarcodeScanner, public http: HttpService, public utils: Utils) {
		this.initForm();
	}
}