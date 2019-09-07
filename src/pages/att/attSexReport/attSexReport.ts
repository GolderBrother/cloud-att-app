import { Component, ViewChild, ElementRef } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Utils } from '../../../providers/utils';
import { HttpService } from '../../../providers/http-service';
import { API_REPORT_GET_BY_TYPE } from '../../../providers/api';
import echarts from 'echarts';
//性别比例报表
@Component({
    selector:"page-attSexReport",
    templateUrl:"attSexReport.html"
})
export class AttSexReportPage {
    @ViewChild('AttChartContainer')
    chartContainer:ElementRef;
    chart:any;

    // 总数  男数量  女数量
    maleCount:number = 0;//男
    femaleCount:number = 0;//女
    // otherCount:number = 0;//其他:
    total:number = 0; // 总的

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
        if(!this.chart) {
            let ctx = this.chartContainer.nativeElement;
            this.chart = echarts.init(ctx);
        }
        this.utils.translate.get(['PERS_MALE', 'PAGE_GENDER_RATE', 'PERS_FEMALE', 'COMMON_OTHER']).subscribe(val => {
            this.chart.setOption({
                tooltip : {
                    trigger: 'item',
                    formatter: "{a} <br/>{b} : {c} ({d}%)"
                },
                legend: {
                    // orient: 'vertical',
                    // top: 'middle',
                    width: '70%',
                    bottom: 10,
                    left: 'center',
                    data: [val['PERS_FEMALE'], val['PERS_MALE']]
                },
                series:[
                    {
                        name: val['PAGE_GENDER_RATE'],
                        type: 'pie',
                        radius: '60%', //饼图的半径大小  
                        center: ['50%', '50%'], //饼图的位置 
                        data:[
                            {value:this.femaleCount, name:`${val['PERS_FEMALE']}(${this.femaleCount})`},
                            {value:this.maleCount, name:`${val['PERS_MALE']}(${this.maleCount})`}
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
    queryInfo(): Promise<any>  {
        return new Promise(async (resolve:Function, reject:Function) => {
            // 这边报表数据的接口用同一个接口，传递报表类型(type)来区分请求数据
            try {
                const REPORT_TYPE = "gender";
                const res = await this.http.post(API_REPORT_GET_BY_TYPE, {appId:this.http.appId, type: REPORT_TYPE}, true);
                if(res['ret'] === this.http.success) {
                    if(!res['data'])  {
                        this.utils.translate.get(['COMMON_NODATA']).subscribe(value => {
                            this.utils.message.loading(value['COMMON_NODATA'], 1000);
                            return resolve(null);
                        });
                    }
                    this.maleCount = Number(res['data']['maleCount']) || 0;
                    this.femaleCount = Number(res['data']['femaleCount']) || 0;
					resolve(res);
				} else {
                    reject(res);
				} 
            } catch (error) {
                reject(error);
            }
		});
    }

    constructor(public navCtrl:NavController, public utils: Utils, public http: HttpService) {
        
    }
}
