import { Component } from '@angular/core';
import { NavController, NavParams, Keyboard } from 'ionic-angular';
import { HomePage } from '../home/home';
import { RegisterPage } from '../register/register';
import { ForgetPage } from '../forget/forget';
import { Storage } from '@ionic/storage';
import { TranslateService } from '@ngx-translate/core';
import { Validators, FormGroup } from '@angular/forms';
import { HttpService } from '../../../providers/http-service';
import { CommonValidator } from '../../../providers/common-validator';
import { Utils } from '../../../providers/utils';
import { API_LOGIN } from '../../../providers/api';
import { Md5 } from 'ts-md5/dist/md5';
// import { serverVersion } from '../../../providers/constants';


@Component({
  selector: 'page-login',
  templateUrl: 'login.html'
})
export class LoginPage {
  form: FormGroup;
  oldPass:any;
  // versionMsg:string='';
  // version:string='';
  copyright:string;
  showCopyRight:boolean = true;
  logo:string='assets/img/login_logo.png';
  rememberMe:Boolean=false;
  imgLang:string = 'zh';

  ionViewDidEnter() {
    this.http.initToken();
  }

  inputFocus() {
     this.showCopyRight = false;
  }

  inputBlur() {
     this.showCopyRight = true;
  }

  ionViewDidLoad() {
    // this.storage.get('OPEN_DOOR').then(v => {
    //   if(typeof v !== 'boolean') {
    //     this.storage.set('OPEN_DOOR', true);
    //   }
    // })
    this.utils.doTimeout((c) => {
      this.initLogo();
      this.http.initToken();
      // this.translate.get(['LOGIN_VERSION']).subscribe(values => {
      //   this.versionMsg = this.utils.stringFormat(values['LOGIN_VERSION'], serverVersion);
      // });
    }, 50, 100);
  }

  login() {

    if(this.keyboard.isOpen()) {
      this.keyboard.close();
    }

    //通过cv的valid()方法判断是否校验通过
    if (!this.cv.valid(this.form)) {
      return;
    }
    this.oldPass = this.form.value.password;

    if(this.form.value.password.length != 32) {//非MD5字符串
      this.form.value.password = Md5.hashStr(this.form.value.password);
    }
    this.utils.message.loading('LOGIN_MSG', -1,null,'loader-custom loader-bg-hidden');
    //this.navCtrl.setRoot(HomePage, {menus:[]});
    this.http.post(API_LOGIN, this.form.value,true).then(res=> {
      if (res['ret'] === this.http.success) {
        this.utils.message.closeMessage();
        this.form.value.password = this.oldPass;
        this.storage.set('REMEMBER', this.rememberMe);
        if(res['data']) {
          this.storage.set('USER', Object.assign(this.form.value, res['data']));
        }
        else {
          this.storage.set('USER', this.form.value);
        }
        //this.http.initToken();
        this.http.access_token = res['data']['token'];
        this.http.appId = this.form.value.appId;
        this.http.customerId = res['data']['customerId'];
        this.storage.set('MEUNS', res['data']['permission']); 
        if(this.navCtrl.length() > 1) {
           if(typeof this.navParams.data.callback === 'function') {
              this.navParams.data.callback();
           }
           this.navCtrl.pop();
        } else {
            this.navCtrl.setRoot(HomePage, {menus: res['data']['permission']});
        }
      } else {
        this.form.value.password = this.oldPass;
        this.utils.message.error(res['msg']||res['ret'], 3000,null,'loader-custom loader-bg-hidden');
      }
    }, err => {
        this.form.value.password = this.oldPass;
        this.utils.message.error('LOGIN_FAILED', 3000,null,'loader-custom loader-bg-hidden');
    });
  }

  register() {
  	this.navCtrl.push(RegisterPage);
  }

  forget() {
  	this.navCtrl.push(ForgetPage);
  }

  initForm() {

    //通过cv创建表单验证
    this.form = this.cv.validate({
      rules:{//校验规则
        phoneNumber:[Validators.required],
        password:[Validators.required]
      },
      message: {//提示消息
        phoneNumber: 'LOGIN_ERR_MSG1',
        password: 'LOGIN_ERR_MSG2'
      },
      noStatusChange:true//关闭状态变更触发提示
    });


    //设置初始值
    this.storage.get("REMEMBER").then(rem =>{
      if(rem) {
        this.storage.get('USER').then(val=>{
          if(val) {
            this.form.controls['phoneNumber'].setValue(val.phoneNumber || '');
            this.form.controls['password'].setValue(val.password || '');
          }
        })
        this.rememberMe = rem;
      } 
    })
    
  }

  initLogo() {
    if(this.translate.currentLang === 'zh') {
      this.imgLang = 'zh';
      this.logo = 'assets/img/login_logo.png';
    } else {
      this.imgLang = 'en';
      this.logo = 'assets/img/login_logo_en.png';
    }
  }

  initVersion() {
    this.storage.get('version').then(v => {
      if(v) {
        //  this.version = v;
      } else {
        setTimeout(() => {
          this.initVersion()
        }, 50);
      }
    })
  }
  
  constructor(public navCtrl: NavController, public navParams:NavParams, public keyboard:Keyboard, public storage: Storage, public translate: TranslateService, public utils: Utils, public http: HttpService, public cv:CommonValidator) {
    this.initLogo();
    this.initForm();
    this.http.initToken();
    // this.initVersion();
    this.copyright = '2008-'+new Date().getFullYear();
  }

}
