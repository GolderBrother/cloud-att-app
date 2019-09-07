import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { HttpService } from '../../../providers/http-service';
import { Utils } from '../../../providers/utils';
import { pager } from '../../../providers/constants';
import { API_DEV_LIST } from '../../../providers/api';

//设备
@Component({
    selector:"page-attDevice",
    templateUrl:"attDevice.html"
})
export class AttDevicePage {
    devCount:number=0;
    items: any;
    filter:string = '';
    isLast:boolean;

    /**
	 * 查询数据
	 * @param  {Event} ev: any           [事件对象]
	 * @return {void} 
	 */
	search(ev: any):void {
		this.query({}, true).then(rep => {}, err=>{});
    }

    /**
	 * 下拉刷新数据
	 * @param  {any} event 
	 * @return {void}
	 */
	doRefresh(event:any):void {
		this.filter = '';
		this.utils.beforeRefresh('page-attDevice');
		this.query(null, true).then(res=>{
			event.complete();
			this.utils.afterRefresh('page-attDevice');
		}, err => {
			event.complete();
			this.utils.afterRefresh('page-attDevice');
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
		        this.query(pager({}, this.items.length),true, true).then(res => {
		        	resolve();
		        }, err => {
		        	resolve();
		        });
		    }, 500);
	    });
	}
    
    /**
	 * 查询
	 * @param  {any} params       [查询参数:{pageNo:1,pageSize:20,filter:'name or pin'}]
	 * @param  {boolean} hideLoad [隐藏加载样式]
	 * @param  {boolean} append   [追加数据]
	 * @return {Promise<any>}     
	 */
	query(params?: any, hideLoad?: boolean, append?: boolean): Promise<any> {
		if(!params) {
			params = pager({appId:this.http.appId,filter:this.filter});
		} 
		else{
			params = Object.assign(pager({appId:this.http.appId,filter:this.filter}), params);
		}
		return new Promise((resolve:any, reject) => {
			this.http.post(API_DEV_LIST, params, hideLoad,25000).then(res => {
				if(res['ret'] === this.http.success) {
					if(!resolve(res)) {
						this.devCount = res['total'];
						if(append) {
							this.items = this.items.concat(res['data']);
						} else {
							this.items = res['data'];
						}
						if(res['data'].length < params.pageSize) {
			              this.isLast = true;
			            }
					}	
				} else {
					reject(res);
					this.utils.message.error(res['msg'] || 'ATT_DEV_FAIL');
				}
			}, err => {
				reject(err);
				this.utils.message.error('ATT_DEV_FAIL');
			})
		});
	}

    constructor(public navCtrl:NavController, public http: HttpService, public utils:Utils) {
      this.search(null);
    }
}
