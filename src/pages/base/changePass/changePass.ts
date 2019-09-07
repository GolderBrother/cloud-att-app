import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { FormGroup, Validators, AbstractControl} from '@angular/forms';
import { HttpService } from '../../../providers/http-service';
import { CommonValidator } from '../../../providers/common-validator';
import { Utils } from '../../../providers/utils';
import { API_PERS_UPDATE_PSW } from '../../../providers/api';
import { Md5 } from 'ts-md5/dist/md5';
//修改密码
@Component({
    selector:"page-changePass",
    templateUrl:"changePass.html"
})
export class ChangePassPage {
    form: FormGroup;
    initForm() {
        //通过cv创建表单验证
        this.form = this.cv.validate({
            rules:{//校验规则
                oldPassword:['', Validators.required],
                newPassword:['', Validators.required],
                checkPassword:['', this.pswChecker]
            },
            message: {//提示消息
                oldPassword: 'USER_ERR_MSG_5',
                checkPassword: "USER_ERR_MSG1",
                newPassword: "USER_ERR_MSG_6"
            },
            noStatusChange:true//关闭状态变更触发提示
        });
    }

    pswChecker(control: AbstractControl): {[key: string]: boolean} {	
		if(control.root.value.newPassword !== control.value) {
			return {nomatch:true};
		}
		return null;
    }
    
    save() {
        if(!this.cv.valid(this.form)) {
            return;
        }
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
    }


    constructor(public navCtrl:NavController,  public utils: Utils, public http: HttpService, public cv:CommonValidator) {
        this.initForm();
    }
}
