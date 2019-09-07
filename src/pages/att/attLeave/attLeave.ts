import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { FormGroup, Validators } from '@angular/forms';
import { HttpService } from '../../../providers/http-service';
import { CommonValidator } from '../../../providers/common-validator';
import { Utils } from '../../../providers/utils';
import { API_ATT_LEAVEADD, API_PERS_INFO } from '../../../providers/api';
//请假
@Component({
    selector: "page-attLeave",
    templateUrl: "attLeave.html"
})
export class AttLeavePage {
    currentStartTime: string;
    currentEndTime: string;
    form: FormGroup;

    /**
     * 提交请假申请
     * 包含的表单字段: 请假开始时间、请假结束时间、请假理由
     */
    apply() {
        if (!this.cv.valid(this.form)) {
            return;
        }
        const isLegalTime = this.verifyTime();
        if (!isLegalTime) return;
        this.form.value.startDatetime = this.form.value.startDatetime.replace("T", " ").replace("Z", " ");
        this.form.value.startDatetime = this.form.value.startDatetime.split('.')[0];
        this.form.value.endDatetime = this.form.value.endDatetime.replace("T", " ").replace("Z", " ");
        this.form.value.endDatetime = this.form.value.endDatetime.split('.')[0];
        this.http.post(API_ATT_LEAVEADD, this.form.value).then(res => {
            if (res['ret'] === this.http.success) {
                this.utils.message.success('COMMON_OP_SUCCESS');
                setTimeout(() => {
                    this.navCtrl.pop();
                }, 1500)
            } else {
                this.utils.message.error(res['msg'] || 'COMMON_OP_FAILED');
            }
        }, err => {
            this.utils.message.error('COMMON_OP_FAILED');
        })
    }


    /**
     * 开始时间和结束时间比较校验
     * @return { boolean } 是否为合法的时间区间
     */
    verifyTime(): boolean {
        let msg = "",
            isLegalTime = false;
        const startTimeStamp = new Date(this.form.value.startDatetime).getTime() || 0,
            endTimeStamp = new Date(this.form.value.endDatetime).getTime() || 0;
        if (startTimeStamp >= endTimeStamp) {
            msg = "ATT_LEAVE_TIME_UNLEGAL";
            isLegalTime = false;
            this.utils.message.error(msg);
        } else {
            isLegalTime = true;
        }
        return isLegalTime;
    }

    initForm() {
        if (this.navParams.data && this.navParams.data.date) {
            this.currentStartTime = new Date(this.navParams.data.date.getTime() + 8 * 3600 * 1000).toISOString();
        } else {
            this.currentStartTime = new Date(new Date().getTime() + 8 * 3600 * 1000).toISOString();
        }
        this.currentEndTime = this.currentStartTime;
        //通过cv创建表单验证
        this.form = this.cv.validate({
            rules: {//校验规则
                startDatetime: [this.currentStartTime],
                endDatetime: [this.currentEndTime],
                remark: ['', Validators.required],
                applyStatus: [0],
                personPin: [''],
                appId: [this.http.appId]
            },
            message: {
                remark: 'ATT_LEAVE_REASON_NOT_EMPTY'
            },
            noStatusChange: true//关闭状态变更触发提示
        });
        this.http.get(API_PERS_INFO, { customerId: this.http.customerId }).then(res => {
            if (res['ret'] == this.http.success) {
                this.form.controls['personPin'].setValue(res['data']['pin'])
            }
        }, err => { })
    }

    constructor(public navCtrl: NavController, public navParams: NavParams, public utils: Utils, public http: HttpService, public cv: CommonValidator) {
        this.initForm();
    }
}
