// 系统-- 网络设置
import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { LoginPage } from '../login/login';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { Storage } from '@ionic/storage';
import { Validators, FormGroup } from '@angular/forms';
import { HttpService } from '../../../providers/http-service';
import { TranslateService } from '@ngx-translate/core';
import { ZKMessage } from '../../../providers/zk-message';
import { CommonValidator } from '../../../providers/common-validator';
import { Utils } from '../../../providers/utils';
import { serverVersion } from '../../../providers/constants';

@Component({
	selector: 'page-network',
	templateUrl: 'network.html'
})

export class NetworkPage {
	form: FormGroup;
	msg:any;
	versionMsg:string='';
	version:string='';
	copyright:string;
	logo:string='assets/img/login_logo.png';
	imgLang:string = 'zh';

	showCopyRight:boolean = true;

	inputFocus() {
	    this.showCopyRight = false;
	}

	inputBlur() {
	    this.showCopyRight = true;
	}

	initLogo() {
	    if(this.translate.currentLang === 'zh') {
	      this.imgLang = 'zh';
	      this.logo = 'assets/img/login_logo.png';
	    } else {
	      this.logo = 'assets/img/login_logo_en.png';
	      this.imgLang = 'en';
	    }
	}

	initForm() {
		//通过cv创建表单验证
	    this.form = this.cv.validate({
	      rules:{//校验规则
	        address: ['', Validators.required],
			barcode: ['', Validators.required],
			username: [''],
			uuid: ['']
	      },
	      message: {//提示消息
	        address: 'NETWORK_ERR_MSG1',
	        barcode: 'NETWORK_ERR_MSG3'
	      },
	      noStatusChange:true//关闭状态变更触发提示
	    });
	    this.storage.get('SERVER').then(val => {
			if (val) {
				this.form.controls['address'].setValue(val.address || '');
				this.form.controls['barcode'].setValue(val.barcode || '');
				this.form.controls['username'].setValue(val.username || '');
			}
		});
	}

	initVersion() {
	    this.storage.get('version').then(v => {
	      if(v) {
	         this.version = v;
	      } else {
	        setTimeout(() => {
	          this.initVersion()
	        }, 50);
	      }
	    })
  	}

	constructor(public navCtrl: NavController, public utils: Utils, public zkmessage: ZKMessage, public storage: Storage, public barcodeScanner: BarcodeScanner, public http: HttpService, public cv:CommonValidator,public translate: TranslateService) {
		this.initForm();
		this.initLogo();
		this.initVersion();
		this.copyright = '2008-'+new Date().getFullYear();
		translate.get(['NETWORK_CONNECTING','NETWORK_CONNECTSUC','NETWORK_CONNECTFAIL', 'LOGIN_VERSION']).subscribe(values=>{
			this.msg = values;
			this.versionMsg = this.utils.stringFormat(values['LOGIN_VERSION'], serverVersion);
		});
	}

	checkAddress(address?:any): Promise<any> {
		return new Promise(resolve => {
			if(address && address.indexOf('http') !== 0 ) {//协议检测
				this.zkmessage.loading('NETWORK_CHECK',-1,null,'loader-custom loader-network');
				let url = this.http.url;
				this.http.setUrl('http://' + this.form.value.address);
				this.http.post('app/v1/testConnect', this.form.value, true, 15000, null, true).then(resp=>{
					if(resp['ret'] === 'OK') {
						this.zkmessage.closeMessage();
						this.form.controls['address'].setValue('http://'+address);
						this.http.setUrl(url);
						resolve();
					} else {
						this.http.setUrl('https://' + this.form.value.address);
						this.http.post('app/v1/testConnect', this.form.value, true).then(resp=>{
							if(resp['ret'] === 'OK') {
								this.zkmessage.closeMessage();
								this.form.controls['address'].setValue('https://'+address);
								this.http.setUrl(url);
								resolve();
							}
						}, err => {
							this.http.setUrl(url);
						});
					}
				}, err => {
					this.http.setUrl('https://' + this.form.value.address);
					this.http.post('app/v1/testConnect', this.form.value, true, 15000, null).then(resp=>{
						if(resp['ret'] === 'OK') {
							this.zkmessage.closeMessage();
							this.form.controls['address'].setValue('https://'+address);
							this.http.setUrl(url);
							resolve();
						}
					}, err => {
						this.http.setUrl(url);
					});
				});
				
			} else {
				resolve()
			}
		});
		
	}

	testLink() {
		if (!this.cv.valid(this.form)) {
      		return;
    	}
    	this.checkAddress(this.form.value.address).then(() => {
    		this.zkmessage.loading(this.msg['NETWORK_CONNECTING'],-1,null,'loader-custom loader-network');
			let url = this.http.url;
			this.http.setUrl(this.form.value.address);
			this.http.post('app/v1/testConnect',this.form.value,true).then(resp=>{
				if(resp['ret'] === 'OK') {
					this.zkmessage.success(this.msg['NETWORK_CONNECTSUC'], 1000, null, 'loader-custom loader-network');
				} else {
					this.http.setUrl(url);
					this.zkmessage.error(resp['message']);
				}
			}, err => {
				this.http.setUrl(url);
				this.zkmessage.error(this.msg['NETWORK_CONNECTFAIL'], 1000, null, 'loader-custom loader-network');
			});
    	});
	}

	save() {
		if (!this.cv.valid(this.form)) {
      		return;
    	}
    	//this.storage.set('SERVER', this.form.value);
		//this.http.setUrl(this.form.value.address);
    	this.checkAddress(this.form.value.address).then(() =>{
    		this.storage.get('deviceUUID').then(uuid => {
		         this.form.controls['uuid'].setValue(uuid);
		         let url = this.http.url;
		         this.http.setUrl(this.form.value.address);
		         this.zkmessage.loading('NETWORK_SAVING', -1, null, 'loader-custom loader-network');
		         this.http.post('app/v1/appBinding', this.form.value, true).then(res => {
		         	if(res['ret'] === 'OK') {
		         		this.zkmessage.closeMessage();
		         		this.storage.set('SERVER', this.form.value);
						this.http.setUrl(this.form.value.address);
						this.http.initToken();
						this.navCtrl.setRoot(LoginPage);
		         	} else {
		         		this.http.setUrl(url);
						this.zkmessage.error(res['message']||res['ret']||'NETWORK_ERR_MSG2', 1000, null, 'loader-custom loader-network');
		         	}
		         }, err => {
		         	this.http.setUrl(url);
		         	this.zkmessage.error('NETWORK_ERR_MSG2', 1000, null, 'loader-custom loader-network');
		         });
	    	})
    	});	
	}

	codeScan() {
		this.barcodeScanner.scan().then(data=>{
			this.form.controls['barcode'].setValue(data.text);
		})
	}
}
