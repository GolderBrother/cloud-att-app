import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Utils } from '../../../providers/utils';
import { HttpService } from '../../../providers/http-service';
import { pager } from '../../../providers/constants';
import { API_ATT_EMP_LIST, API_ATT_INFO } from '../../../providers/api';
import echarts from 'echarts';
//考勤信息
@Component({
    selector:"page-attInfo",
    templateUrl:"attInfo.html"
})
export class AttInfoPage {
    
    chart:any;
    mode:any='state';
    lang:string = 'zh';
    currentTime:any;
    curStr:string;

    weeks:Array<string>;//星期简写数组
	fullWeeks:Array<string>;//星期简写

    leaveCount:number = 0;	//休假人数
    lateCount:number = 0;	//迟到人数
	leakageCount:number = 0; //漏卡人数
	tripCount:number = 0; //出差人数
	outCount:number = 0; //外出人数
	noShiftCount:number = 0; //未排班人数
	addShiftCount:number = 0; //补班人数
	earlyCount:number = 0; //早退人数

    shouldNum:number = 0;//应到人数
    actualNum:number = 0;//实到人数

	

    isLast:boolean;
    items: Array<any> = [];        //数据源

	getRate(num) {
		return this.shouldNum>0 ? num*100/this.shouldNum:0;
	}

	getMinWidth(num:any) {
		if(num) {
			return (num+'').length *1.5+'rem';
		}
	}
    
    @ViewChild('AttChartContainer')
    chartContainer:ElementRef;


    initChart() {
        if(!this.chart) {
            let ctx = this.chartContainer.nativeElement;
            this.chart = echarts.init(ctx);
		}
		this.getCurrentDateString();
        this.chart.setOption({
            series:[
                {
                    name: '出勤情况',
                    type: 'pie',
                    radius:['80%', '100%'],
                    itemStyle: this.getItemStyle({label:{show:false},labelLine:{show:false}}),
                    data:[{value:this.shouldNum - this.actualNum, name:'缺勤',itemStyle:this.getItemStyle({color:'#ddd'})},{value:this.actualNum, name:'出勤',itemStyle:this.getItemStyle({color:'#53affe'})}]
                }
            ]
        });
    }

    getItemStyle(item:any) {
		var itemStyle= {
			normal: item,
			emphasis: item	
		}
		return itemStyle;
	}

    ionViewDidLoad() {
        this.currentTime = this.utils.dateToString(new Date());
        this.initWeekI18n();
        setTimeout(() => {
            this.mode = 'state';
            this.queryInfo().then(res => {
                this.initChart();
            }, err => {}) 
        }, 100);
    }

    /**
	 * 下拉刷新数据
	 * @param  {any} event 
	 * @return {void}
	 */
	doRefresh(event:any):void {
		this.utils.beforeRefresh('page-attInfo');
		this.query(null, true).then(res=>{
			event.complete();
			this.utils.afterRefresh('page-attInfo');
		}, err => {
			event.complete();
			this.utils.afterRefresh('page-attInfo');
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

    segmentChanged(event:any) {
        if(this.mode=="emp"){
            this.query({}, true).then(res => {}, err => {});
		}
		else if(this.mode == 'state') {
			this.queryInfo().then(res => {
                this.initChart();
            }, err => {}) 
		}
    }

    /**
	 * 星期数组初始化
	 * @return {[type]} [description]
	 */
	initWeekI18n():void {
		let wi18n = [];
		let fwi18n = [];
		for(let i=1; i<8; i++) {
			wi18n.push('COMMON_WEEK1_'+i);
			fwi18n.push('COMMON_FULLWEEK_'+i);
		}
		this.utils.translate.get(wi18n).subscribe(vals => {
			this.weeks = [];
			wi18n.forEach(key => {
				this.weeks.push(vals[key]);
			})
		});
		this.utils.translate.get(fwi18n).subscribe(vals => {
			this.fullWeeks = [];
			fwi18n.forEach(key => {
				this.fullWeeks.push(vals[key]);
			});
        })
        this.getCurrentDateString();
    }
    

    getCurrentDateString():void {
        if(this.currentTime) {
            var date = new Date(this.currentTime.replace(/-/g, "/"));
            this.curStr = this.fillZero(date.getMonth()+1) + '.' + this.fillZero(date.getDate()) + ' ' + this.weeks[this.getDay(date)-1];
        }
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
    
    queryInfo(): Promise<any>  {
        return new Promise((resolve:any, reject) => {
			this.http.post(API_ATT_INFO, {appId:this.http.appId,date: this.currentTime}, true).then(res => {
				if(res['ret'] === this.http.success) {
					let data = res['data'];
					this.shouldNum = data.shouldSign || 0;
                    this.actualNum = data.actualSign || 0;
                    this.lateCount = data.lateCount || 0;
					this.leaveCount = data.leaveCount || 0;
					this.leakageCount = data.leakageCount || 0; 
					this.tripCount = data.tripCount || 0; 
					this.outCount = data.outCount || 0; 
					this.noShiftCount = data.noShiftCount || 0; 
					this.addShiftCount = data.addShiftCount || 0;   
					this.earlyCount =  data.earlyCount || 0; 
					resolve(res);
				} else {
					reject(res);
				}
			}, err => {
				reject(err);
			})
		});
	}
	
	dateChange(e:any) {
		if(this.mode == 'state') {
			this.queryInfo().then(res => {
                this.initChart();
            }, err => {}) 
		} else if(this.mode == 'emp') {
			this.query().then(res => {}, err => {})
		}
	}

	initItems(arr : Array<any>) {
		if(arr && arr.length > 0) {
			arr.forEach(element => {
				if(element.startWorkTime == '[') {
					element.startWorkTime = '';
				}
				if(element.endWorkTime == ']') {
					element.endWorkTime = '';
				}
			});
		}
		return arr;
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
			params = pager({appId:this.http.appId,date: this.currentTime});
		} else {
			params = Object.assign(pager({appId:this.http.appId,date: this.currentTime}), params);
		}
		return new Promise((resolve:any, reject) => {
			this.http.post(API_ATT_EMP_LIST, params, hideLoad).then(res => {
				if(res['ret'] === this.http.success) {
					if(!resolve(res) && res['data']) {
						if(append) {
							this.items = this.items.concat(this.initItems(res['data']));
						} else {
							this.items = this.initItems(res['data']);
						}
						if(res['data'].length < params.pageSize) {
			              this.isLast = true;
			            }
						
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

    constructor(public navCtrl:NavController, public utils: Utils, public http: HttpService) {
        this.lang = this.utils.translate.currentLang;
    }
}
