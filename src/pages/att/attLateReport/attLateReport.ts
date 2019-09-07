import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Utils } from '../../../providers/utils';
import { HttpService } from '../../../providers/http-service';
import { API_REPORT_GET_BY_TYPE } from '../../../providers/api';
import echarts from 'echarts';
//每日迟到报表
@Component({
    selector: "page-attLateReport",
    templateUrl: "attLateReport.html"
})
export class AttLateReportPage {
    @ViewChild('AttChartContainer')
    chartContainer: ElementRef;
    chart: any;

    // 人员信息，日期，打卡时间，迟到多久
    // 总人数，迟到人数，未迟到人数
    total: number = 0;//总人数
    lateNumber: number = 0;//迟到人数
    unLateNumber: number = 0; // 未迟到人数

    /*
        getItemStyle(item: any) {
            var itemStyle = {
                normal: item,
                emphasis: item
            }
            return itemStyle;
        }
    */

    /**
     * 初始化图表
     */
    initChart() {
        if (!this.chart) {
            let ctx = this.chartContainer.nativeElement;
            this.chart = echarts.init(ctx);
        }
        this.utils.translate.get(['PAGE_DAY_LATE', 'PERS_COUNT_ALL', 'PERS_COUNT_LATE', 'PERS_COUNT_UNLATE']).subscribe(val => {
            this.chart.setOption({
                tooltip: {
                    trigger: 'item',
                    formatter: "{a} <br/>{b} : {c} ({d}%)"
                },
                legend: {
                    // orient: 'vertical',
                    // top: 'middle',
                    bottom: 10,
                    left: 'center',
                    data: [val['PERS_COUNT_LATE'], val['PERS_COUNT_UNLATE']]
                },
                series: [
                    {
                        name: val['PAGE_DAY_LATE'],
                        type: 'pie',
                        radius: '60%', //饼图的半径大小  
                        center: ['50%', '50%'], //饼图的位置 
                        data: [
                            { value: this.lateNumber, name: `${val['PERS_COUNT_LATE']}(${this.lateNumber})` },
                            { value: this.unLateNumber, name: `${val['PERS_COUNT_UNLATE']}(${this.unLateNumber})` }
                            // {value:this.name, name:"人员信息" + '('+this.name + ')'},
                            // {value:this.date, name:"日期" + '('+this.date + ')'},
                            // {value:this.signInDate, name:"打卡时间" + '('+this.signInDate + ')'},
                            // {value:this.leaveLong, name:"早退多久" + '('+this.leaveLong + ')'}
                        ]
                    }
                ]
            });
        })
    }

    /**
     * 渲染图表数据
     */
    // 如果需要操作DOM的，需要在这个页面加载的钩子函数中执行
    ionViewDidLoad() {
        (async () => {
            try {
                const res = await this.queryInfo();
                if(res) this.initChart();
            } catch (error) {
                this.utils.message.error(error.msg || error.message);
            }
        })();
    }

    /**
     * 查询数据
     */
    queryInfo(): Promise<any> {
        return new Promise(async (resolve: any, reject) => {
            // 这边报表数据的接口用同一个接口，传递报表类型(type)来区分请求数据
            try {
                const REPORT_TYPE = "late";
                const res = await this.http.post(API_REPORT_GET_BY_TYPE, { appId: this.http.appId, type: REPORT_TYPE }, true);
                if (res['ret'] === this.http.success) {
                    if(!res['data'])  {
                        this.utils.translate.get(['COMMON_NODATA']).subscribe(value => {
                            this.utils.message.loading(value['COMMON_NODATA'], 1000);
                            return resolve(null);
                        });
                    }
                    this.total = Number(res['data']['total'] || 0);
                    this.lateNumber = Number(res['data']['lateNumber'] || 0);
                    this.unLateNumber = (Number(this.total) - Number(this.lateNumber)) || 0;
                    resolve(res);
                } else {
                    reject(res);
                }
            } catch (error) {
                reject(error);
            };
        });
    }

    constructor(public navCtrl: NavController, public utils: Utils, public http: HttpService) {

    }
}
