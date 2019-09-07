import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams } from 'ionic-angular';
import { ZkTree } from '../../base/zkTree/zkTree';
import { FormControl } from '@angular/forms';
import { HttpService } from '../../../providers/http-service';
import { Utils } from '../../../providers/utils';
import { API_PERS_DEPT } from '../../../providers/api';

@Component({
	selector: 'page-persSelectDept',
	templateUrl: 'persSelectDept.html' 
})

export class PersSelectDeptPage {

	@ViewChild(ZkTree) tree: ZkTree;

	dataSource:Array<any> = [];

	depts:FormControl;
	
	ionViewDidLoad() {
		this.initData();
	}

	initData() {
		this.http.get(API_PERS_DEPT, {appId:this.http.appId}).then(res => {
			if(res['ret'] == this.http.success) {
				this.dataSource = res['data'];
				setTimeout(() => {
					if(this.navParams.data.persForm.value['deptCode']) {
						this.depts.setValue(this.navParams.data.persForm.value['deptCode']);
					}
				},20)
				
			}
		}, err => {})
	}

	doSubtmit() {
		let ids:Array<any> = this.tree.getCheckedItems();
		if(ids.length>0) {
			this.navParams.data.persForm.controls['deptCode'].setValue(ids[0]['code']);
			this.navParams.data.persForm.controls['deptName'].setValue(ids[0]['text']);
		} else {
			this.navParams.data.persForm.controls['deptCode'].setValue('');
			this.navParams.data.persForm.controls['deptName'].setValue('');
		}
		this.navCtrl.pop();
	}

	constructor(public navCtrl: NavController, public utils:Utils, public http: HttpService, public navParams:NavParams) {
	
		this.depts = new FormControl();
	}
}