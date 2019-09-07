// 考勤-- 考勤月历
import { Component } from '@angular/core'
import { NavController } from 'ionic-angular';
import { TranslateService } from '@ngx-translate/core';
import { Utils } from '../../../providers/utils';
import { Storage } from '@ionic/storage';
import { HttpService } from '../../../providers/http-service';
import { API_ATT_SHIFT } from '../../../providers/api';
import { AttSignPage } from '../attSign/attSign';

@Component({
	selector: 'page-attMine',
	templateUrl: 'attMine.html' 
})

export class AttMinePage {
	
	mode:any='mode1';
	weeks:Array<string>;//星期简写数组
	fullWeeks:Array<string>;//星期简写
	msg:any = {};
	days:Array<Array<any>>; //日期二维数组
	activeDay:any = {date:new Date(), items:[]};//选中日期
	curDay:Date;//当前日期
	attInfo:any;//考勤信息
	todayText:string;
	toMonthText:string;
	show:boolean = true;

	showRow1:boolean = true;
	showRow2:boolean = true;
	shouldTime:any = '-';//应勤工时
	actualTime:any = '-';//实际工时
	absentTime:any = '-';//旷工同时
	missTime:any = '-';  //缺卡次数

	/**
	 * 页面进入后执行
	 */
	ionViewDidEnter() {
		this.initWeekI18n();
	}

	/**
	 * 星期数组初始化
	 * @return {[type]} [description]
	 */
	initWeekI18n():void {
		let wi18n = [];
		let fwi18n = [];
		for(let i=1; i<8; i++) {
			wi18n.push('COMMON_WEEK_'+i);
			fwi18n.push('COMMON_FULLWEEK_'+i);
		}
		this.translate.get(wi18n).subscribe(vals => {
			this.weeks = [];
			wi18n.forEach(key => {
				this.weeks.push(vals[key]);
			})
		});
		this.translate.get(fwi18n).subscribe(vals => {
			this.fullWeeks = [];
			fwi18n.forEach(key => {
				this.fullWeeks.push(vals[key]);
			});
		});
		this.translate.get(['ATT_INFO_TYPE_LEAKAGE', 'ATT_SHIFT_NONE']).subscribe(vals => {
			this.msg = vals;
		});
		this.todayText = this.getTodayText();
		this.toMonthText = this.getDateText(this.curDay, true);
	}

	/**
	 * 选中事件
	 * @param  {[type]} day:{date:Date, hours?:number, shift?:string, attCount?:number, isCurMonth?:boolean, items?:Array<any>} [description]
	 * @return {[type]}                  [description]
	 */
	activeClick(day:any):void {
		if(!day.isCurMonth) {
			return;
		}
		this.activeDay = day;
		this.reloadTimeInfo();
		this.todayText = this.getDateText(day.date);
		this.toMonthText = this.getDateText(day.date, true);
	}

	/**
	 * 切换月份
	 * @param  {[type]} event [description]
	 * @return {[type]}       [description]
	 */
	changeMonth(event:any) :void{
		if(event.offsetDirection === 4) {
			this.curDay.setMonth(this.curDay.getMonth() - 1);
		}
		else {
			this.curDay.setMonth(this.curDay.getMonth() + 1);
		}
		this.activeDay = {date:this.curDay, items: []};
		this.reloadTimeInfo();
		this.todayText = this.getTodayText();
		this.toMonthText = this.getDateText(this.curDay, true);
		this.initItem();
	}

	constructor(public navCtrl: NavController, public http:HttpService, public storage:Storage, public translate:TranslateService, public utils:Utils) {
		this.curDay = new Date();
		this.initItem();
		setTimeout(() => {
			this.show = false;
		}, 800)
	}

	/**
	 * 获取月份第一天
	 * @type {[type]}
	 */
	getFirstDay(day:Date):Date {
		let first:Date = new Date(day.getTime());
		first.setDate(1);
		return first;
	}

	/**
	 * 获取前n日
	 * @type {[type]}
	 */
	getPrevDay(day:Date, n?:number):Date {
		let prev:Date = new Date(day.getTime());
		if(typeof (n)==='undefined') {
			n = 1;
		}
		prev.setDate(day.getDate() - n);
		return prev;
	}

	/**
	 * 获取后n日
	 * @type {[type]}
	 */
	getNextDay(day:Date, n?:number):Date {
		let next:Date = new Date(day.getTime());
		if(typeof (n)==='undefined') {
			n = 1;
		}
		next.setDate(day.getDate() + n);
		return next;
	}

	/**
	 * 获取当月最大日期
	 * @type {[type]}
	 */
	getMaxDay(day:Date):number{
		let max:number = 27;
		let month:number = day.getMonth();
		let maxDay:Date = new Date(day.getTime());
		maxDay.setDate(max);
		for(let i=1; i<6; i++) {
			if(this.getNextDay(maxDay, i).getMonth() !== month) {
				max = max+i-1;
				break;
			}
		}
		return max;
	}

	/**
	 * 获取当前日期文本
	 */
	getTodayText(): string {
		if(!this.fullWeeks) {
			return '';
		}
		let today:Date = this.curDay;
		let s = today.getFullYear()+'-'+ this.fillZero(today.getMonth()+1)+'-'+this.fillZero(today.getDate())+ ' '+ this.fullWeeks[this.getDay(today) - 1];
		return s;
	}

	/**
	 * 获取指定日期文本
	 * @param today 指定日期
	 * @param m 是否只显示年月
	 */
	getDateText(today:Date, m?:boolean): string {
		if(m) {
			return today.getFullYear()+'-'+ this.fillZero(today.getMonth()+1);
		}
		if(!this.fullWeeks) {
			return '';
		}
		let s = today.getFullYear()+'-'+ this.fillZero(today.getMonth()+1)+'-'+this.fillZero(today.getDate())+ ' '+ this.fullWeeks[this.getDay(today) - 1];
		return s;
	}

	/**
	 * 获取星期
	 * @param  {[type]} d:Date [description]
	 * @return {[type]}        [description]
	 */
	getDay(d:Date):number {
		return d.getDay() === 0 ? 7 : d.getDay();
	}

	/**
	 * 填充零
	 * @param  {[type]} n:number [description]
	 * @return {[type]}          [description]
	 */
	fillZero(n:number):string {
		return n < 10 ? '0'+ n : '' + n;
	}

	/**
	 * 跳转到补签页面
	 */
	goToSign() {
		this.navCtrl.push(AttSignPage, this.activeDay);
	}

	/**
	 * 初始化考勤信息
	 * @return {[type]} [description]
	 */
	initItem():void {
		this.initDays();
		this.toMonthText = this.getDateText(this.curDay, true);
		this.http.get(API_ATT_SHIFT, {schDate:this.toMonthText, customerId:this.http.customerId}).then(res => {
			if(res['ret'] == this.http.success) {
				this.attInfo = res['data'];
				this.mergeInfo();
			} else {
				this.utils.message.error(res['msg'] || 'ATT_SHIFT_FAIL');
			}
		}, err=>{
			this.utils.message.error('ATT_SHIFT_FAIL');
		})
	}

	/**
	 * 重新计算考勤工时信息
	 */
	reloadTimeInfo() {
		this.shouldTime = this.activeDay.shouldHour || '-';
		this.actualTime = this.activeDay.actualHour || '-';
		this.absentTime = this.activeDay.absentHour || '-';
		this.missTime = this.activeDay.lackCardCount || '-';
		if(this.absentTime == '-' && this.missTime == '-') {
			//this.showRow2 = false;
		} else {
			this.showRow2 = true;
		}
	}

	/**
	 * 获取打卡显示文本
	 * @param d 
	 */
	getShiftTime(d:any) {
		if(d == "L") {
			return this.msg['ATT_INFO_TYPE_LEAKAGE'];
		} else if(d == 'W') {
			return this.msg['ATT_SHIFT_NONE'];
		}
		return d;
	}

	/**
	 * 合并考勤信息和日期二维数组
	 * @param  {[type]} today?:Date [description]
	 * @return {[type]}             [description]
	 */
	mergeInfo(today?:Date):void {
		if(!today) {
			today = this.curDay|| new Date(); 
		}
		let first = this.getFirstDay(today);
		let offset:number = this.getDay(first)-2;
		if(this.attInfo && Array.isArray(this.attInfo)) {
			Object.keys(this.attInfo).forEach(key => {				
				let i:number = parseInt(this.attInfo[key]['date'].split("-")[2]);
				let m = parseInt((i+offset)/7+'');
				let n = (i+offset)%7;
				if(this.attInfo[key]['appAttValidCardItems']) {
					this.days[m][n].items = this.attInfo[key]['appAttValidCardItems'];
					this.days[m][n] = Object.assign(this.attInfo[key], this.days[m][n]);
					if(this.isDateEqual(this.curDay, this.days[m][n].date)) {
						this.activeDay = this.days[m][n];
						this.reloadTimeInfo();
					}
				}
			});
		}
		this.reloadTimeInfo();
	}

	/**
	 * 比较两个日期的年月日
	 * @param d1 日期1
	 * @param d2 日期2
	 */
	isDateEqual(d1:Date, d2:Date) {
		if(d1.getFullYear() == d2.getFullYear() && d1.getMonth()==d2.getMonth() && d1.getDate() == d2.getDate()) {
			return true;
		} 
		return false;
	}

	/**
	 * 判断是否异常考勤
	 * @param shift 
	 */
	isErrorShift(shift:any) {
		if(typeof(shift)!='undefined' && shift==1) {
			return true;
		}
		return false;
	}

	hasShift(day:any) {
		if(typeof(day.attState) != 'undefined') {
			if(day.attState==0 && (!day.items || day.items.length == 0)) {
				return false;
			}
			return true;
		}
		return false;
	}

	/**
	 * 获取状态颜色
	 * @param state 状态 
	 */
	getStateColor(state?:number) {
		if(typeof state === 'undefined' || state < 0) {
			return '#fff';
		} else if(state > 0) {
			return '#7ac143';
		} else {
			return '#fea803';
		}
	}

	/**
	 * 初始化日期二维数组
	 * @param  {[type]} today?:Date [description]
	 * @return {[type]}             [description]
	 */
	initDays(today?:Date) :void {		
		if(!today) {
			today = this.curDay || new Date(); 
		}
		this.days = [];
		let first:Date = this.getFirstDay(today);
		this.days[0] = [];
		for(let i=0; i< this.getDay(first)-1; i++) {
			this.days[0].push({date: this.getPrevDay(first, this.getDay(first)-1-i), text:'', items:[]});
		}

		let max:number = this.getMaxDay(today);
		let index:number = 0;
		for(let k = 0; k < max; k++) {
			if(this.days[index].length === 7) {
				index++;
				this.days[index] = [];
			}
			let nextDay = this.getNextDay(first,k);
			if(nextDay.getDate() === today.getDate()) {
				this.days[index].push({date:nextDay, text:k+1, isCurMonth:true, isToday:true,items:[]});
			} else {
				this.days[index].push({date:nextDay, text:k+1, isCurMonth:true, items:[]});
			}
		}
		let last:number = 7 - this.days[index].length;
		for(let j = 0; j<last; j++) {
			this.days[index].push({date: this.getNextDay(first, max + j), text:'', items:[]});
		}
	}
}