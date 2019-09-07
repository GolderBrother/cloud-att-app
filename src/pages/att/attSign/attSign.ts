import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { FormGroup, Validators } from '@angular/forms';
import { HttpService } from '../../../providers/http-service';
import { CommonValidator } from '../../../providers/common-validator';
import { Utils } from '../../../providers/utils';
import { API_ATT_SIGNADD, API_PERS_INFO } from '../../../providers/api';
//补签
@Component({
    selector:"page-attSign",
    templateUrl:"attSign.html"
})
export class AttSignPage {
    currentTime:any;
    form: FormGroup;
    
    apply() {
        if(!this.cv.valid(this.form)) {
            return;
        }
        this.form.value.signDatetime = this.form.value.signDatetime.replace("T", " ").replace("Z", " ");
        this.form.value.signDatetime = this.form.value.signDatetime.split('.')[0];
        this.http.post(API_ATT_SIGNADD, this.form.value).then(res => {
            if(res['ret'] === this.http.success) {
                this.utils.message.success('COMMON_OP_SUCCESS');
                setTimeout(() => {
                    this.navCtrl.pop();
                }, 1500)
            } else {
                this.utils.message.error('COMMON_OP_FAILED');
            }
        }, err => {
            this.utils.message.error('COMMON_OP_FAILED');
        })
    }

    initForm() {
        if(this.navParams.data && this.navParams.data.date) {
            this.currentTime = new Date(this.navParams.data.date.getTime() + 8 * 3600 * 1000).toISOString();
        } else {
            this.currentTime = new Date(new Date().getTime() + 8 * 3600 * 1000).toISOString();
        }
        //通过cv创建表单验证
        this.form = this.cv.validate({
            rules:{//校验规则
                signDatetime:[this.currentTime],
                remark:['', Validators.required],
                applyStatus:[0],
                personPin:[''],
                appId:[this.http.appId]
            },
            message:{
                remark:'ATT_WAIT_MSG4' 
            },
            noStatusChange:true//关闭状态变更触发提示
        });
        this.http.get(API_PERS_INFO, {customerId:this.http.customerId}).then(res => {
            if(res['ret'] == this.http.success) {
                this.form.controls['personPin'].setValue(res['data']['pin'])
            }
        }, err => {})
    }

    constructor(public navCtrl:NavController, public navParams:NavParams, public utils: Utils, public http: HttpService, public cv:CommonValidator) {
      this.initForm();
    }
}
