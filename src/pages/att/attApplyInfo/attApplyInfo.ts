import { Component } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { Utils } from '../../../providers/utils';
import { HttpService } from '../../../providers/http-service';
import { pager } from '../../../providers/constants';
import { API_ATT_SIGNLIST, API_ATT_WAITLIST } from '../../../providers/api';
//申请信息
@Component({
	selector: "page-attApplyInfo",
	templateUrl: "attApplyInfo.html"
	// styleUrls: ['./attApplyInfo.scss']
})
export class AttApplyInfoPage {

	mode: any = 'wait';
	isLast: boolean;
	waitList: Array<any> = [];        //待审批列表数据源
	signList: Array<any> = [];        //已审批列表数据源
	applyType: string = ''; 		// 申请类型：补签卡、请假

	msg1: any;
	msg2: any;

	formatDate(s:any) {
		if(s && /[\d]{1,2}:[\d]{1,2}:[\d]{1,2}$/.test(s)) {
			return s.substring(0, s.lastIndexOf(":"));
		}
		return s;
	}

    /**
	 * 查询人员
	 * @param  {any} params       [查询参数:{pageNo:1,pageSize:20,filter:'name or pin'}]
	 * @param  {boolean} hideLoad [隐藏加载样式]
	 * @param  {boolean} append   [追加数据]
	 * @return {Promise<any>}     
	 */
	query(params?: any, hideLoad?: boolean, append?: boolean): Promise<any> {
		this.isLast = false;
		if (!params) {
			params = pager({ appId: this.http.appId, customerId: this.http.customerId });
		} else {
			params = Object.assign(pager({ appId: this.http.appId, customerId: this.http.customerId }), params);
		}
		// applyType：待办类型 过滤数据
		params = Object.assign(params, { applyType: this.applyType });
		let url: string = "";
		url = this.mode == 'wait' ? API_ATT_WAITLIST : API_ATT_SIGNLIST;
		return new Promise((resolve: any, reject) => {
			this.http.post(url, params, hideLoad).then(res => {
				if (res['ret'] === this.http.success) {
					if (!resolve(res)) {
						if (append) {
							if (this.mode == 'wait') {
								this.waitList = [...this.waitList, ...res['data']];
							} else {
								this.signList = [...this.signList, ...res['data']];
							}

						} else {
							if (this.mode == 'wait') {
								this.waitList = res['data'];
							} else {
								this.signList = res['data'];
							}
						}
						if (res['data'].length < params.pageSize) {
							this.isLast = true;
						}

					}
				} else {
					this.utils.message.error(res['msg'] || 'COMMON_LIST_FAIL');
					reject(res);
				}
			}, err => {
				console.log(err);
				this.utils.message.error('COMMON_LIST_FAIL');
				reject(err);
			})
		});
	}


    /**
	 * 下拉刷新数据
	 * @param  {any} event 
	 * @return {void}
	 */
	doRefresh(event: any): void {
		this.utils.beforeRefresh('page-attApplyInfo');
		this.query(null, true).then(res => {
			event.complete();
			this.utils.afterRefresh('page-attApplyInfo');
		}, err => {
			event.complete();
			this.utils.afterRefresh('page-attApplyInfo');
		})
	}

	/**
	 * 上拉加载数据
	 * @return {Promise<any>}
	 */
	doInfinite(): Promise<any> {
		this.isLast = false;
		return new Promise((resolve) => {
			setTimeout(() => {
				this.query(pager({}, this.mode == 'wait' ? this.waitList.length : this.signList.length), true, true).then(res => {
					resolve();
				}, err => {
					resolve();
				});
			}, 500);
		});
	}

	segmentChanged(event: any) {
		if (this.mode == "wait" && this.waitList.length == 0) {
			this.query({}, true);
		} else if (this.mode == "deal" && this.signList.length == 0) {
			this.query({}, true);
		}
	}

	constructor(public navCtrl: NavController, public navParams: NavParams, public utils: Utils, public http: HttpService) {
		this.applyType = this.navParams.data;
		this.query().then(res => { }, er => { });
		this.utils.translate.get(['ATT_SIGN_MSG']).subscribe(val => {
			this.msg1 = val['ATT_SIGN_MSG'].split('{0}')[0] || '';
			this.msg2 = val['ATT_SIGN_MSG'].split('{0}')[1] || '';
		})

	}
}
