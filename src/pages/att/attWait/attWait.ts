import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Utils } from '../../../providers/utils';
import { HttpService } from '../../../providers/http-service';
import { pager } from '../../../providers/constants';
import { API_ATT_WAITLIST } from '../../../providers/api';
import { AttWaitDetailPage } from '../attWaitDetail/attWaitDetail';
//待办
@Component({
	selector: "page-attWait",
	templateUrl: "attWait.html"
})
export class AttWaitPage {
	items: Array<any> = [];        //数据源
	isLast: boolean;
	applyType: string = 'signCard'; 		// 待办类型：补签卡、请假

	/**
 * 下拉刷新数据
 * @param  {any} event 
 * @return {void}
 */
	doRefresh(event: any): void {
		this.utils.beforeRefresh('page-attWait');
		this.query(null, true).then(res => {
			event.complete();
			this.utils.afterRefresh('page-attWait');
		}, err => {
			event.complete();
			this.utils.afterRefresh('page-attWait');
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
				this.query(pager({}, this.items.length), true, true).then(res => {
					resolve();
				}, err => {
					resolve();
				});
			}, 500);
		});
	}

	/**
	 * 显示信息详情页面
	 * @param  {any} item [人员信息]
	 * @return {void}  
	 */
	showDetail(item: any): void {
		this.navCtrl.push(AttWaitDetailPage, item);
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
			params = pager({ appId: this.http.appId });
		} else {
			params = Object.assign(pager({ appId: this.http.appId }), params);
		}
		// let url: string = "";
		// if(this.applyType === 'signCard') {
		// 	url = API_ATT_WAITLIST;
		// }else if(this.applyType === 'leaveApply') {
		// 	url = API_ATT_WAITLEAVELIST;
		// }
		return new Promise((resolve: any, reject) => {
			this.http.post(API_ATT_WAITLIST, params, hideLoad).then(res => {
				if (res['ret'] === this.http.success) {
					if (!resolve(res)) {
						this.items = append ? [...this.items, ...res['data']] : res['data'];
						this.items = this.items.map(item => {
							// 请假时间区间不具体到秒
							if (item.applyType === "1") {
								let { startDatetime, endDatetime } = item;
								item.startDatetime = startDatetime.substr(0, startDatetime.lastIndexOf(":"));
								item.endDatetime = endDatetime.substr(0, endDatetime.lastIndexOf(":"));
							} else {
								item.signDatetime = item.signDatetime.substr(0, item.signDatetime.lastIndexOf(":"));
							}
							return item;
						})
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

	constructor(public navCtrl: NavController, public utils: Utils, public http: HttpService) {
		this.query().then(res => { }, err => { })
	}
}
