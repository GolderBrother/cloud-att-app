import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { FormGroup, Validators, AbstractControl} from '@angular/forms';
import { HttpService } from '../../../providers/http-service';
import { CommonValidator } from '../../../providers/common-validator';
import { Utils } from '../../../providers/utils';
import { API_PERS_INFO,API_PERS_INFO_SAVE, API_PERS_UPDATE_PSW } from '../../../providers/api';
import { Md5 } from 'ts-md5/dist/md5';

//个人信息
@Component({
    selector:"page-baseInfo",
    templateUrl:"baseInfo.html"
})
export class BaseInfoPage {
    form: FormGroup;
    item:any;
    initForm() {
        //通过cv创建表单验证
        this.form = this.cv.validate({
            rules:{//校验规则
                mobile:[''],
                name:[''],
                email:[''],
                oldPassword:['', Validators.required],
                newPassword:['', Validators.required],
                checkPassword:['', this.pswChecker],
                resetPassword:[false]
            },
            message: {//提示消息
                oldPassword: 'USER_ERR_MSG_5',
                checkPassword: "USER_ERR_MSG1",
                newPassword: "USER_ERR_MSG_6"
            },
            noStatusChange:true//关闭状态变更触发提示
        });
        this.loadInfo();
    }

    pswChecker(control: AbstractControl): {[key: string]: boolean} {	
		if(control.root.value.newPassword !== control.value) {
			return {nomatch:true};
		}
		return null;
	}

    loadInfo() {
        this.http.get(API_PERS_INFO, {customerId:this.http.customerId}, true).then(res => {
            if(res['ret'] == this.http.success) {
                this.item = res['data'];
                this.form.controls['name'].setValue(res['data']['name']);
                this.form.controls['email'].setValue(res['data']['email']);
                this.form.controls['mobile'].setValue(res['data']['mobile']);
            }
        }, err => {})
    }

    save() {
        this.item.name = this.form.value.name;
        this.item.email = this.form.value.email;
        if(this.form.value.resetPassword) { 
            if(!this.cv.valid(this.form)) {
                return;
            }
        }
        //this.item.resetPassword = this.form.value.resetPassword;
        this.http.post(API_PERS_INFO_SAVE, this.item).then(res => {
            if(res['ret']==this.http.success) {
                this.updatePassword();
            } else {
				this.utils.message.error(res['msg']|| 'COMMON_OP_FAILED')
			}
        }, err => {
            this.utils.message.error('COMMON_OP_FAILED');
        })
    }

    updatePassword() {
        if(this.form.value.resetPassword) {
            let params = {};
            params['customerId'] = this.http.customerId;
            params['oldPassword'] = Md5.hashStr(this.form.value.oldPassword);
            params['newPassword'] = Md5.hashStr(this.form.value.newPassword);
            this.http.post(API_PERS_UPDATE_PSW, params).then(res => {
                if(res['ret'] == this.http.success) {
                    this.utils.message.success('COMMON_OP_SUCCESS');
                    setTimeout(() => {
                        this.navCtrl.pop();
                    },1000);
                } else {
                    this.utils.message.error(res['msg']|| 'COMMON_OP_FAILED')
                }
            }, err => {
                this.utils.message.error('COMMON_OP_FAILED');
            })
        } else {
            this.utils.message.success('COMMON_OP_SUCCESS');
            setTimeout(() => {
                this.navCtrl.pop();
            },1000);
        }
    }

    constructor(public navCtrl:NavController, public utils: Utils, public http: HttpService, public cv:CommonValidator) {
      this.initForm();
    }
}
