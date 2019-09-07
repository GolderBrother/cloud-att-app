import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController, NavParams, ActionSheetController } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import { Camera, CameraOptions } from '@ionic-native/camera';
import { ImagePicker } from '@ionic-native/image-picker';
import { PersPhotoEditPage } from '../persPhotoEdit/persPhotoEdit';
import { Utils } from '../../../providers/utils';
import { ImageUtils } from '../../../providers/image-utils';
import { HttpService } from '../../../providers/http-service';
import { API_USER_PIC } from '../../../providers/api';

@Component({
	selector: 'page-persPhoto',
	templateUrl: 'persPhoto.html' 
})

export class PersPhotoPage {
	
	photoImg:string;
	showButton:boolean;

	imageUtils:ImageUtils = new ImageUtils();

	bgSize:string='';
	@ViewChild('persPhoto') photoBox:ElementRef;
	
	constructor(public navCtrl: NavController, public utils:Utils, public http: HttpService, public imagePicker: ImagePicker, public navParams: NavParams, public camera: Camera, public asCtrl:ActionSheetController, public translate:TranslateService) {
		this.showButton = false;
		this.photoImg = this.navParams.data.photoImg;
		this.setBgSize();
	}

	setBgSize() {
		this.imageUtils.readImage(this.photoImg).then((img:HTMLImageElement) => {
			let bg = this.photoBox.nativeElement.clientWidth/this.photoBox.nativeElement.clientHeight;
			let imr = img.naturalWidth/img.naturalHeight;
			this.bgSize = bg > imr ? 'auto 100%' : '100% auto';
		});
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
		 	this.navCtrl.push(PersPhotoEditPage, {img:'data:image/jpeg;base64,' + imageData});
		}, (err) => {
			this.utils.message.closeMessage();
		});
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
				this.navCtrl.push(PersPhotoEditPage, {img: results[0]});
			} else {
				this.utils.message.closeMessage();
			}
		}, (err) => {
			this.utils.message.closeMessage();
		});
	}

	save() {
		let params = {};
		params['mobile'] = this.navParams.data.persForm.controls['mobile'].value;
		params['photoBase64'] = this.photoImg.substring('data:image/jpeg;base64,'.length);
		this.http.post(API_USER_PIC, params, true).then(res=>{
			if(res['ret'] == this.http.success) {
				this.navParams.data.persForm.controls['avatarUrl'].setValue(res['data']['avatarUrl']);
				this.navParams.data.persForm.controls['cropUrl'].setValue(res['data']['cropUrl']);
				this.navCtrl.pop();
			} else {
				this.utils.message.error(res['msg'] || 'REG_MSG_PHOTO');
			}
		}, err=>{
			this.utils.message.error('REG_MSG_PHOTO');
		})
	}

	cancel() {
		this.navCtrl.pop();
	}

	change() {
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
}