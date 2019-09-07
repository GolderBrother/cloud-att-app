import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { HttpService } from '../../../providers/http-service';
import { Utils } from '../../../providers/utils';
import { API_ATT_WAIT_PASS } from '../../../providers/api';

//待办详情
@Component({
    selector: "page-attWaitDetail",
    templateUrl: "attWaitDetail.html"
})
export class AttWaitDetailPage {
    item: any = {}
    applyType: string = ''; 	// 待办类型：补签卡、请假
    applyUrl: string = '';		// 审核请求接口

    // 通过
    pass(): void {
        if (!this.applyUrl) return;
        this.http.post(this.applyUrl, { id: this.item.id }, false).then(res => {
            if (res['ret'] == this.http.success) {
                this.utils.message.success('COMMON_OP_SUCCESS');
                setTimeout(() => {
                    this.navCtrl.getByIndex(1).instance.query().then(resp => { }, err => { });
                    this.navCtrl.pop();
                }, 1000);
            } else {
                this.utils.message.error(res['msg'] || 'COMMON_OP_FAILED')
            }
        }, err => {
            this.utils.message.error('COMMON_OP_FAILED');
        })
    }

    // 拒绝
    reject(): void {
        if (!this.applyUrl) return;
        this.http.post(this.applyUrl, { id: this.item.id, applyStatus: '2' }, false).then(res => {
            if (res['ret'] == this.http.success) {
                this.utils.message.success('COMMON_OP_SUCCESS');
                setTimeout(() => {
                    this.navCtrl.getByIndex(1).instance.query().then(resp => { }, err => { });
                    this.navCtrl.pop();
                }, 1000);
            } else {
                this.utils.message.error(res['msg'] || 'COMMON_OP_FAILED')
            }
        }, err => {
            this.utils.message.error('COMMON_OP_FAILED');
        })
    }

    constructor(public navCtrl: NavController, public navParams: NavParams, public utils: Utils, public http: HttpService) {
        // 这边的待办类型需要从 this.navParams.data 来确定
        this.applyType = this.navParams.data.applyType;
        // 这边需要根据 applyType 区分补签卡、请假调用不同的请求接口
        // if(this.applyType === "sign") {
        //     this.applyUrl = API_ATT_WAIT_PASS;
        // }else if(this.applyType === "leave") {
        //     this.applyUrl = API_ATT_LEAVE_PASS;
        // }
        this.applyUrl = API_ATT_WAIT_PASS;
        this.item = this.navParams.data;
    }
}
