import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Utils } from '../../../providers/utils';
import { HttpService } from '../../../providers/http-service';
import { API_REPORT_GET_BY_TYPE } from '../../../providers/api';
import echarts from 'echarts';
//当前员工in/out报表
@Component({
    selector: "page-attInoutReport",
    templateUrl: "attInoutReport.html"
})
export class AttInoutReportPage {
    @ViewChild('AttChartContainer')
    chartContainer: ElementRef;
    chart: any;

    // 总数  进入人数  离开人数
    total: number = 0; // 总的
    inNumber: number = 0;//进入人数
    outNumber: number = 0;//离开人数

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
        this.utils.translate.get(['PAGE_CURRENT_EMPLOYEE_INOUT', 'PERS_COUNT_ALL', 'PERS_COUNT_IN', 'PERS_COUNT_OUT']).subscribe(val => {
            this.chart.setOption({
                tooltip: {
                    trigger: 'item',
                    formatter: "{a} <br/>{b} : {c} ({d}%)"
                },
                legend: {
                    // orient: 'vertical',
                    // top: 'middle',
                    // width: '60%',
                    left: 'center',
                    bottom: 10,
                    data: [val['PERS_COUNT_IN'], val['PERS_COUNT_OUT']]
                },
                series: [
                    {
                        type: 'pie',
                        name: val['PAGE_CURRENT_EMPLOYEE_INOUT'],
                        radius: '60%', //饼图的半径大小  
                        center: ['50%', '50%'], //饼图的位置 
                        data: [
                            { value: this.inNumber, name: `${val['PERS_COUNT_IN']}(${this.inNumber})` },
                            { value: this.outNumber, name: `${val['PERS_COUNT_OUT']}(${this.outNumber})` }
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
        return new Promise(async (resolve: Function, reject: Function) => {
            // 这边报表数据的接口用同一个接口，传递报表类型(type)来区分请求数据
            try {
                const REPORT_TYPE = "inout";
                const res = await this.http.post(API_REPORT_GET_BY_TYPE, { appId: this.http.appId, type: REPORT_TYPE }, true);
                if (res['ret'] === this.http.success) {
                    if(!res['data'])  {
                        this.utils.translate.get(['COMMON_NODATA']).subscribe(value => {
                            this.utils.message.loading(value['COMMON_NODATA'], 1000);
                            return resolve(null);
                        });
                    }
                    this.inNumber = Number(res['data']['inNumber'] || 0);
                    this.outNumber = Number(res['data']['outNumber'] || 0);
                    this.total = Number(res['data']['total'] || 0);
                    resolve(res);
                } else {
                    reject(res);
                }
            } catch (error) {
                reject(error);
            }
        });
    }

    constructor(public navCtrl: NavController, public utils: Utils, public http: HttpService) {

    }
}
