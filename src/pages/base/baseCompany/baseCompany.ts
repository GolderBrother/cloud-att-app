import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { HttpService } from '../../../providers/http-service';
import { API_COMP_GET } from '../../../providers/api';
//我的企业
@Component({
    selector:"page-baseCompany",
    templateUrl:"baseCompany.html"
})
export class BaseCompanyPage {
    item:any = {};

    initItem():void {
        this.http.get(API_COMP_GET, {appId:this.http.appId}).then(res=>{
            if(res["ret"]==this.http.success) {
                this.item = res["data"];
            } else {
                this.http.utils.message.error(res['msg']||'BASE_COMP_FAIL');
            }
        }, err=>{
            this.http.utils.message.error('BASE_COMP_FAIL');
        })
    }

    constructor(public navCtrl:NavController, public http: HttpService) {
      this.initItem();
    }
}
