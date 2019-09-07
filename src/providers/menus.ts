import { Injectable } from '@angular/core';

//pages
import { PersListPage } from '../pages/pers/persList/persList';
import { PersAddPage } from '../pages/pers/persAdd/persAdd';
import { PersSetPage } from '../pages/pers/persSet/persSet';
import { AttInfoPage } from '../pages/att/attInfo/attInfo';
import { AttReportPage } from '../pages/att/attReport/attReport';
import { AttDevicePage } from '../pages/att/attDevice/attDevice';
import { AttWaitPage } from '../pages/att/attWait/attWait';
import { AttApplyPage } from '../pages/att/attApply/attApply';
import { AttSignPage } from '../pages/att/attSign/attSign';
import { AttLeavePage } from '../pages/att/attLeave/attLeave';
import { AttMinePage } from '../pages/att/attMine/attMine';
import { AttPunchPage } from '../pages/att/attPunch/attPunch';
/* import { BaseSetPage } from '../pages/base/baseSet/baseSet'; */
import { BaseCompanyPage } from '../pages/base/baseCompany/baseCompany';
import { BaseInfoPage } from '../pages/base/baseInfo/baseInfo';
import { UserSettingPage } from '../pages/base/userSetting/userSetting';
import { TranslateService } from '@ngx-translate/core';


@Injectable()
export class ZkMenus {

	menus:any;
	permission:Array<Array<string>>;
	
	constructor(public translate: TranslateService) {
		this.initMenus();
	}

	getMenus(type:any, items: Array<any>) {
		let newItems = [];
		items.forEach(child => {
			if(this.permission[type].indexOf(child['name'])!=-1) {
				newItems.push(child);
			}
		});
		return newItems;
	}

	/**
	 * 过滤获取菜单
	 * @param  {[type]} items: Array<any>    菜单数组
	 * @return {[type]}        [description]
	 */
	getFilterMenus(items: Array<any>) {
		items.forEach(child => {
			child['icon'] = child['icon'] || this.menus[child['name']]['icon'];
			child['color'] = child['color'] || this.menus[child['name']]['color'];
			child['component'] = this.menus[child['name']]['component'];
			child['text'] = this.menus[child['name']]['text'];
		});
		return items;
	}
	
	private initMenus() {
		this.permission = [[
			'attApply',
			'attSign',
			'baseInfo',
			'baseSet',
			'attMine',
			'attPunch',
			'attLeave'
		],[
			'persList',
			/* 'persAdd', */
			'baseSet',
			'attInfo',
			'attReport',
			'attDevice',
			'baseCompany',
			'attWait'
		]];
		this.menus = {
			persList: {//人事
				icon: 'person-admin',
				component: PersListPage,
				text: 'PAGE_PERSLIST',
				color: '#e9745d'
			}, 
			persAdd: {//新增
				icon: 'person-add',
				component: PersAddPage,
				text: 'PAGE_PERSADD',
				color: '#7ac143'
			}, 
			persSet: {//设置
				icon: 'person-setting',
				component: PersSetPage,
				text: 'PAGE_PERSSET',
				color: '#fdbc44'
			},
			attInfo: {//考勤信息
				icon: 'att-reports',
				component: AttInfoPage,
				text: 'PAGE_ATTINFO',
				color: '#29a9ec'
			},
			attReport: {//报表
				icon: 'att-statistics ',
				component: AttReportPage,
				text: 'PAGE_ATTREPORT',
				color: '#00bf8f'
			},
			attDevice: {//设备
				icon: 'vis-module',
				component: AttDevicePage,
				text: 'PAGE_ATTDEVICE',
				color: '#e9745d'
			},
			attPunch: {//打卡
				icon: 'location',
				component: AttPunchPage,
				text: 'PAGE_ATTPUNCH',
				color: '#7f43c1'
			},
			baseCompany: {//我的企业
				icon: 'person-setting',
				component: BaseCompanyPage,
				text: 'PAGE_BASECOMPANY',
				color: '#fdbc44'
			},
			attWait: {//待办
				icon: 'acc-report',
				component: AttWaitPage,
				text: 'PAGE_ATTWAIT',
				color: '#bd4bfe'
			},
			attApply: {//我的申请
				icon: 'card',
				component: AttApplyPage,
				text: 'PAGE_ATTAPPLY',
				color: '#7ac143'
			},
			attSign: {//补签
				icon: 'appoint',
				component: AttSignPage,
				text: 'PAGE_ATTSIGN',
				color: '#fdbc44'
			},
			attLeave: {//请假
				icon: 'appoint',
				component: AttLeavePage,
				text: 'PAGE_ATTLEAVE',
				color: '#fdbc44'
			},
			baseInfo: {//个人信息
				icon: 'rightgroup',
				component: BaseInfoPage,
				text: 'PAGE_BASEINFO',
				color: '#29a9ec'
			},
			baseSet: {//设置
				icon: 'setting',
				component: UserSettingPage,
				text: 'PAGE_BASESET',
				color: '#00bf8f'
			},
			attMine: {//我的考勤
				icon: 'park-auth',
				component: AttMinePage,
				text: 'PAGE_ATTMINE',
				color: '#29a9ec'
			}
		}
	}
}