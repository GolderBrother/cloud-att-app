import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { HttpService } from '../../../providers/http-service';
import { Geolocation, GeolocationOptions } from '@ionic-native/geolocation';
import { Utils } from '../../../providers/utils';
import { API_ATT_PUNCH, API_ATT_PUNCHLIST } from '../../../providers/api';

//打卡
@Component({
    selector: "page-attPunch",
    templateUrl: "attPunch.html"
})
export class AttPunchPage {

    coords: any = {};
    isReach: boolean;
    isLoading: boolean;
    items: Array<any> = [];        //数据源

    position:string;
    time1:string = '';
    time2:string = '';
    fullWeeks:Array<string>;//星期简写
    lang:string = 'zh';
    errObj:any='xx';


    getTime(d: any) {
        if (d) {
            let t = d.split(" ");
            if (t.length > 1) {
                return t[1].substring(0, t[1].lastIndexOf(":"));
            }
        }
        return '';
    }

    getGPS() {
        this.isLoading = true;
        let options:GeolocationOptions = {
            enableHighAccuracy: true,
            timeout:15000
        };
        this.geolocation.getCurrentPosition(options).then((resp) => {
            this.coords = resp.coords;
        }).catch((error) => {
            this.errObj = error;
        });
    }

    d(s:any) {
        return s ? s : '';
    }

    ionViewDidLoad() {
        this.query().then(res => { }, err => { });
    }

    /**
	 * 填充零
	 * @param  {[type]} n:number [description]
	 * @return {[type]}          [description]
	 */
    fillZero(n: number): string {
        return n < 10 ? '0' + n : '' + n;
    }

    getCurrentDate(hasTime?:boolean) {
        let d = new Date();
        let ret = d.getFullYear() + "-" + this.fillZero(d.getMonth() + 1) + "-" + this.fillZero(d.getDate());
        if(hasTime) {
            ret = ret + " " + this.fillZero(d.getHours()) + ":" + this.fillZero(d.getMinutes()) + ":" + this.fillZero(d.getSeconds());
        }
        return ret;
    }

    /**
    * 查询人员
    * @param  {any} params       [查询参数:{pageNo:1,pageSize:20,filter:'name or pin'}]
    * @param  {boolean} hideLoad [隐藏加载样式]
    * @param  {boolean} append   [追加数据]
    * @return {Promise<any>}     
    */
    query(params?: any, hideLoad?: boolean, append?: boolean): Promise<any> {
        if (!params) {
            params = { customerId: this.http.customerId, date: this.getCurrentDate() };
        } else {
            params = Object.assign({ customerId: this.http.customerId, date: this.getCurrentDate() }, params);
        }
        return new Promise((resolve: any, reject) => {
            this.http.post(API_ATT_PUNCHLIST, params, hideLoad).then(res => {
                if (res['ret'] === this.http.success) {
                    if (!resolve(res) && res['data']) {
                        if (append) {
                            this.items = this.items.concat(res['data']);
                        } else {
                            this.items = res['data'];
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

    isCoordsEmpty() :boolean{
        let isIllegalCoords = ((typeof this.coords.latitude) !== "number" && (typeof this.coords.latitude) !== "string")
            || ((typeof this.coords.longitude) !== "number" && (typeof this.coords.longitude) !== "string")
            || this.coords.latitude === '' || this.coords.longitude === '';
        return isIllegalCoords;
    }

    punch() {
        if(this.isCoordsEmpty()) {
            this.utils.message.error('ATT_PUNCH_GET_LOCATION_FAILED');
        } else {
            this.doPunch();
        }
    }

    doPunch() {
       
        // 只要有一个不是number类型且不是string类型，或者为空字符串的，就是不合法的经纬度数据，就不提交
        let params = {};
        params['latLongitude'] = this.coords.latitude + ',' + this.coords.longitude;
        //params['latLongitude'] = '24.61466,118.043667';
        params['attPlace'] = this.position;
        params['customerId'] = this.http.customerId;
        params['language'] = this.lang;
        params['date'] = this.getCurrentDate(true);
        //params['date'] = '2019-03-06 12:00:11';
        this.http.post(API_ATT_PUNCH, params).then(res => {
            this.isLoading = false;
            if (res['ret'] == this.http.success) {
                this.query(null, true).then(res => { }, err => { });
            } else {
                this.utils.message.error(res['msg'] || 'ATT_PUNCH_MSG1');
            }
        }, err => {
            this.isLoading = false;
            this.utils.message.error('ATT_PUNCH_MSG1');
        })
    }

    /**
	 * 星期数组初始化
	 * @return {[type]} [description]
	 */
	initWeekI18n():void {
		let fwi18n = [];
		for(let i=1; i<8; i++) {
			fwi18n.push('COMMON_FULLWEEK_'+i);
		}
		this.utils.translate.get(fwi18n).subscribe(vals => {
			this.fullWeeks = [];
			fwi18n.forEach(key => {
				this.fullWeeks.push(vals[key]);
            });
            this.refreshTime();
		});
    }
    
    /**
	 * 获取星期
	 * @param  {[type]} d:Date [description]
	 * @return {[type]}        [description]
	 */
	getDay(d:Date):number {
		return d.getDay() === 0 ? 7 : d.getDay();
	}

    refreshTime() {
        setInterval(() => {
            let d = new Date();
            this.time1 = this.fillZero(d.getHours()) + ":" + this.fillZero(d.getMinutes()) + ":" + this.fillZero(d.getSeconds());
            this.time2 = d.getFullYear() + "-" + this.fillZero(d.getMonth()+1) + "-" + this.fillZero(d.getDate())+ ' '+ this.fullWeeks[this.getDay(d) - 1];
        }, 1000)
    }

    constructor(public navCtrl: NavController, public http: HttpService,public geolocation: Geolocation, public utils: Utils) {
        this.lang = this.utils.translate.currentLang;
        this.initWeekI18n();
        this.getGPS();
    }
}
