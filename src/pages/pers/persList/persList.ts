// 人事-- 人事
import { Component, ViewChild } from '@angular/core';
import { NavController, Content } from 'ionic-angular';
import { PersAddPage } from '../persAdd/persAdd';
import { HttpService } from '../../../providers/http-service';
import { Utils } from '../../../providers/utils';
import { pager } from '../../../providers/constants';
import { API_PERS_LIST } from '../../../providers/api';


@Component({
	selector: 'page-persList',
	templateUrl: 'persList.html' 
})

export class PersListPage {
	
	items: Array<any> = [];        //数据源
	personCount: number = 0;       //人员总数
	serverUrl: string = '';        //服务器地址
	user: any = {};                     //用户信息
	filter:string = '';
	isLast:boolean;
	lang:string = 'zh';

	@ViewChild(Content) myContent: Content;

	/**
	 * 查询数据
	 * @param  {Event} ev: any           [事件对象]
	 * @return {void} 
	 */
	search(ev: any):void {
		this.query({},true).then(rep => {
			this.myContent.scrollToTop(100);
		}, err=>{});
    }

	/**
	 * 新增人员
	 */
	addPerson() {
		this.navCtrl.push(PersAddPage);
	}

	/**
	 * 下拉刷新数据
	 * @param  {any} event 
	 * @return {void}
	 */
	doRefresh(event:any):void {
		this.filter = '';
		this.utils.beforeRefresh('page-persList');
		this.query(null, true).then(res=>{
			event.complete();
			this.utils.afterRefresh('page-persList');
		}, err => {
			event.complete();
			this.utils.afterRefresh('page-persList');
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
	 * 显示信息详情页面
	 * @param  {any} item [人员信息]
	 * @return {void}  
	 */
	showDetail(item:any) :void{
		this.navCtrl.push(PersAddPage, item);
	}

	/**
	 * 初始化数据项
	 * @param  {Array<any>} _items[数据项]
	 * @return {void}
	 */
	private _initItems(_items?: Array<any>):void {
		_items = _items || this.items;
		_items.forEach(item => {
			if(item['photoPath']) {
				item['photoPath'] = this.utils.appendUrl(this.http.url, item['photoPath']);
			} else {
				item['photoPath'] = this.utils.appendUrl(this.http.url, 'images/appUser/userImage.png');
			}
		})
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
		if(!params) {
			params = pager({appId: this.http.appId, filter:this.filter});
		} else {
			params = Object.assign(pager({appId: this.http.appId, filter:this.filter}), params);
		}
		return new Promise((resolve:any, reject) => {
			this.http.post(API_PERS_LIST, params, hideLoad).then(res => {
				if(res['ret'] === this.http.success) {
					if(!resolve(res) && res['data']) {
						this._initItems(res['data']);
						if(append) {
							this.items = this.items.concat(res['data']);
						} else {
							this.items = res['data'];
						}
						if(res['data'].length < params.pageSize) {
			              this.isLast = true;
			            }
						this.personCount = res['total'];
					}	
				} else {
					this.utils.message.error(res['msg'] || res['ret']);
					reject(res);
				}
			}, err => {
				reject(err);
			})
		});
	}

	/**
	 * 删除人员
	 * @param  {any} item [要删除的人员对象]
	 * @return {void}     
	 */
	delPerson(item:any):void {
		this.http.delConfirm().then(() => {
			this.utils.message.loading();
			this.http.post('app/v1/delRealById', { pin: item.pin }, true).then(resp => {
				if(resp['ret'] === 'OK') {
					this.utils.message.success(resp['msg'] || 'COMMON_DEL_SUCCESS', 2000);
					this.query(null, true).then(rep => {}, err=>{});
				} else {
					this.utils.message.error(resp['msg'] || 'COMMON_DEL_FAILED', 2000, null, 'loader-custom loader-bg-hidden');
				}
		    }, err => {
			    this.utils.message.error('COMMON_DEL_FAILED', 2000, null, 'loader-custom loader-bg-hidden');
		    });
		});
	}

	constructor(public navCtrl: NavController, public utils:Utils, public http: HttpService) {
		this.lang = this.utils.translate.currentLang;
		//获取登录用户和服务器信息
		// this.utils.userCallback().then((u: { user: any, server: any }) => {
		// 	this.serverUrl = u.server['address'];
		// 	this.user = u.user;
		// 	this.query(null).then(rep => {}, err=>{});
		// }, err => {});
		this.query(null).then(rep => {}, err=>{});
	}
}