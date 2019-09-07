import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { Utils } from '../../../providers/utils';
import { HttpService } from '../../../providers/http-service';
import { AttEarlyReportPage } from '../attEarlyReport/attEarlyReport';
import { AttLateReportPage } from '../attLateReport/attLateReport';
import { AttSexReportPage } from '../attSexReport/attSexReport';
import { AttOvertimeReportPage } from '../attOvertimeReport/attOvertimeReport';
import { AttAttendReportPage } from '../attAttendReport/attAttendReport';
import { AttInoutReportPage } from '../attInoutReport/attInoutReport';

interface ReportItem {
    title: string;
    url: Object;
}
//报表
@Component({
    selector: "page-attReport",
    templateUrl: "attReport.html"
})

export class AttReportPage {
    // @ViewChild('AttChartContainer')
    // chartContainer:ElementRef;
    items: Array<ReportItem> = [{ title: "", url: "" }];

    /**
	 * 显示报表数据页面
	 * @param  {any} item [人员信息]
	 * @return {void}  
	 */
    showDetail(item: any): void {
        this.navCtrl.push(item.url, { title: item.title });
    }

    ionViewDidLoad() {
        // this.queryInfo().then(res => {
        //     this.initChart();
        // }, err => {});
    }

    initItems(): void {
        this.utils.translate.get(['PAGE_GENDER_RATE', 'PAGE_DAY_LATE', 'PAGE_DAY_EARLY', 'PAGE_DAY_OVERTIME', 'PAGE_DAY_ATTENDANCE_RATE', 'PAGE_CURRENT_EMPLOYEE_INOUT']).subscribe(value => {
            this.items = [{
                title: value['PAGE_GENDER_RATE'],
                url: AttSexReportPage
            }, {
                title: value['PAGE_DAY_LATE'],
                url: AttLateReportPage
            }, {
                title: value['PAGE_DAY_EARLY'],
                url: AttEarlyReportPage
            }, {
                title: value['PAGE_DAY_OVERTIME'],
                url: AttOvertimeReportPage
            }, {
                title: value['PAGE_DAY_ATTENDANCE_RATE'],
                url: AttAttendReportPage
            }, {
                title: value['PAGE_CURRENT_EMPLOYEE_INOUT'],
                url: AttInoutReportPage
            }]
        })
    }


    constructor(public navCtrl: NavController, public utils: Utils, public http: HttpService) {
        this.initItems();
    }
}
