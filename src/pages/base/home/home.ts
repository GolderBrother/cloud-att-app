import { Component, ViewChild } from '@angular/core';
import { NavController, NavParams, Slides } from 'ionic-angular';
import { ZkMenus } from '../../../providers/menus';
import { UserSettingPage } from '../userSetting/userSetting';
import { HttpService } from '../../../providers/http-service';
import { Storage } from '@ionic/storage';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})

export class HomePage {

  modules: Array<any> = [];
  index: number = 0;
  header_logo:string = 'assets/img/header_logo.png';
  @ViewChild(Slides) slides: Slides;
  @ViewChild('settingIcon') setIcon:any;

  bgPosition:boolean;

  imgLang:string='';

  initLogo() {
    if(this.translate.currentLang === 'zh') {
      this.imgLang = '';
      this.header_logo = 'assets/img/header_logo.png';
    } else {
      this.header_logo = 'assets/img/header_logo_en.png';
      this.imgLang = '_en';
    }
  }


  openPage(page) {
    if(page.component) {
  		this.navCtrl.push(page.component, {home:this, page:page});
  	}
  }

  getSlideHeight() {
    return document.body.offsetWidth * 448/750 + 'px';
  }

  getHeaderHeight() {
    return this.setIcon.elementRef.nativeElement.clientHeight * 1.1 + 'px';
  }

  ionViewDidEnter() {
    this.slides.autoplayDisableOnInteraction=false;
    let ind = this.slides.realIndex;
    setTimeout(() => {
      if(ind === this.slides.realIndex) {
        this.slides.slideTo((this.slides.getActiveIndex()+1)%this.slides.length());
        this.slides.startAutoplay();
      } 
    }, this.slides.autoplay + 1000);
    this.initLogo();
    this.http.initToken();
    //this.loadMenus();
  }

  goToUserSetting() {
    this.navCtrl.push(UserSettingPage);
  }

  group(array: Array<any>, subGroupLength: number) {
      let index = 0;
      let newArray = [];
      while(index < array.length) {
          newArray.push(array.slice(index, index += subGroupLength));
      }
      return newArray;
  }

  groupModule() {
    this.modules= this.group(this.modules, 4);
  }

  initMenus() {
    this.modules = [{
      name: 'persList'
    }, {
      name: 'persAdd'
    }, {
      name: 'attInfo'
    }, {
      name: 'attReport'
    }, {
      name: 'attDevice'
    }, {
      name: 'baseCompany'
    }, {
      name: 'attWait'
    }, {
      name: 'attApply'
    }, {
      name: 'attSign'
    }, {
      name: 'baseInfo'
    }, {
      name: 'baseSet'
    }, {
      name: 'attMine'
    }, {
      name: 'attPunch'
    }, {
      name: 'attLeave'
    }];
  }

  loadMenus() {
    this.storage.get('USER').then(user => {
      if(user) {
        this.initMenus();
        this.modules = this.zkMenus.getMenus(user['personType']||0, this.modules);
        this.modules = this.zkMenus.getFilterMenus(this.modules);
        this.groupModule();
      }
    }) 
   
  }

  ionViewDidLoad() {
    this.http.initToken();
    this.loadMenus();
    //this.initMenus();
  }
  
  constructor(public navCtrl: NavController, public navParams:NavParams, public translate: TranslateService, public zkMenus: ZkMenus, public storage: Storage, public http: HttpService) {
    this.bgPosition = true;
  }
}
