import { Component } from '@angular/core';
import { NavController, ActionSheetController } from 'ionic-angular';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { Validators, FormGroup } from '@angular/forms';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { ImagePicker } from '@ionic-native/image-picker';
import { CommonValidator } from '../../../providers/common-validator';
import { TranslateService } from '@ngx-translate/core';
import { ImageUtils } from '../../../providers/image-utils';
import { Utils } from '../../../providers/utils';
import { PersPhotoEditPage } from '../../pers/persPhotoEdit/persPhotoEdit';
import { HttpService } from '../../../providers/http-service';
import { API_COMP_GET, API_USER_PIC, API_REGISTER } from '../../../providers/api';
import { Md5 } from 'ts-md5/dist/md5';
@Component({
    selector:"page-register",
    templateUrl:"register.html"
})
export class RegisterPage {
    form: FormGroup;
	imageUtils:ImageUtils = new ImageUtils();
	photoData:String = "assets/img/user_avatar.png";

    codeScan() {
        this.barcodeScanner.scan().then(data=>{
			this.http.get(API_COMP_GET, {appId:data.text}, true).then(res => {
				if(res['ret'] == this.http.success) {
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

    showCamera() {
		let options: CameraOptions = {
		  quality: 50,
		  destinationType: this.camera.DestinationType.DATA_URL,
		  encodingType: this.camera.EncodingType.JPEG,
		  mediaType: this.camera.MediaType.PICTURE,
		  allowEdit:false,
		  correctOrientation:true
		}
		this.camera.getPicture(options).then((imageData) => {
			//this.photoData = 'data:image/jpeg;base64,' + imageData;
		 	this.navCtrl.push(PersPhotoEditPage, {img:'data:image/jpeg;base64,' + imageData, mode:"register"});
		}, (err) => {
			this.utils.message.closeMessage();
		});
	}

	callback(d:any) {
		let params = {};
		params['mobile'] = this.form.controls['mobile'].value;
		params['photoBase64'] = d.substring('data:image/jpeg;base64,'.length);
		this.http.post(API_USER_PIC, params, true).then(res=>{
			if(res['ret'] == this.http.success) {
				this.photoData = res['data']['avatarUrl'];
				this.form.controls['avatarUrl'].setValue(res['data']['avatarUrl']);
				this.form.controls['cropUrl'].setValue(res['data']['cropUrl']);
			} else {
				this.utils.message.error(res['msg'] || 'REG_MSG_PHOTO');
			}
		}, err=>{
			this.utils.message.error('REG_MSG_PHOTO');
		})		
	}

	openImgPicker() {
		let options = {
			maximumImagesCount: 1,
			quality: 100,
			width:document.documentElement.clientWidth,
			height:document.documentElement.clientHeight,
			outputType: 0
		}
		this.imagePicker.getPictures(options).then((results) => {
			if(results && Array.isArray(results) && results.length > 0) {
				//this.photoData = results[0];
				this.navCtrl.push(PersPhotoEditPage, {img: results[0],mode:"register"});
			} else {
				this.utils.message.closeMessage();
			}
		}, (err) => {
			this.utils.message.closeMessage();
		});
	}

    change() {
		if(this.form.controls['mobile'].value == '') {
			this.utils.message.error('REG_MSG_MOBILE_IN');
			return;
		}
		this.translate.get(['PERS_PHOTO_CHANGE', 'PERS_PHOTO_CAP', 'PERS_PHOTO_PHONE', 'COMMON_CANCEL']).subscribe(val => {
			let opts = {
				title: val['PERS_PHOTO_CHANGE'],
				buttons: [{
					text: val['PERS_PHOTO_CAP'],
					cssClass:'pers-photo-selected',
					handler: () => {
						//this.utils.message.loading(' ', -1,null,'loader-custom loader-bg-hidden');
						setTimeout(() => {
							this.showCamera();
						}, 500);
					}
				}, {
					text: val['PERS_PHOTO_PHONE'],
					cssClass:'pers-photo-unselected',
					handler: () => {
						//this.utils.message.loading(' ', -1,null,'loader-custom loader-bg-hidden');
						setTimeout(() => {
							this.openImgPicker();
						}, 500);
					}
				}, {
					text: val['COMMON_CANCEL'],
					cssClass:'pers-photo-selected',
					role: 'cancel'
				}]
			}
			this.asCtrl.create(opts).present();
		})
	}

    initForm() {
		//通过cv创建表单验证
	    this.form = this.cv.validate({
	      rules:{//校验规则
	        name: [''],
			pin: ['', Validators.required],
			email: ['', Validators.required],
            mobile: ['', Validators.required],
			password: [''],
			compName: [''],
			avatarUrl: [''],
			cropUrl: [''],
			appId: ['', Validators.required],
			isFrom: ['INDONESIA_PERS_APP']
	      },
	      message: {//提示消息
			pin: 'REG_MSG_PIN',
			mobile:'REG_MSG_MOBILE',
			email:'REG_MSG_EMAIL',
			appId:'REG_MSG_APPID'
	      },
	      noStatusChange:true//关闭状态变更触发提示
	    });
	}


	doRegister() {
		if(!this.cv.valid(this.form)) {
			return;
		}
		this.form.value.password = Md5.hashStr(this.form.value.password);
		this.http.post(API_REGISTER, this.form.value, false, 60000).then(res => {
			if(res['ret'] == this.http.success) {
				this.utils.message.success('REG_SUCCESS');
				setTimeout(() => {
					this.navCtrl.pop();
				}, 1500)
			} else {
				this.utils.message.error(res['msg']||'REG_FAIL');
			}
		}, err => {
			this.utils.message.error('REG_FAIL');
		})
	}
	
    constructor(public navCtrl:NavController, public barcodeScanner: BarcodeScanner,public http: HttpService, public utils:Utils, public cv:CommonValidator, public imagePicker: ImagePicker, public camera: Camera, public asCtrl:ActionSheetController, public translate:TranslateService) {
        this.initForm();
    }
}