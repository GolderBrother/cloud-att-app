import { Component, ViewChild, EventEmitter } from '@angular/core';
import { Platform, Config, IonicApp, Keyboard, Nav } from 'ionic-angular';

import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';
import { AppVersion } from '@ionic-native/app-version';
import { Device } from '@ionic-native/device';
import { ScreenOrientation } from '@ionic-native/screen-orientation';

// import pages 
import { LoginPage } from '../pages/base/login/login';
import { UserSettingPage } from '../pages/base/userSetting/userSetting';

import { Settings } from '../providers/providers';
import { MessageBox } from '../providers/message-box';

import { TranslateService } from '@ngx-translate/core';
import { Storage } from '@ionic/storage';

@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage = LoginPage;
  @ViewChild('myNav') nav: Nav;

  onBack:EventEmitter<any> = new EventEmitter();

  constructor(private translate: TranslateService, private screenOrientation: ScreenOrientation, private keyboard:Keyboard, private app:IonicApp, private msgBox:MessageBox, private device:Device, private storage:Storage, private platform: Platform, settings: Settings, private config: Config, private appVersion: AppVersion, private statusBar: StatusBar, private splashScreen: SplashScreen) {
    this.initTranslate();
    this.app['onBack'] = this.onBack;
    setTimeout(()=> {
      this.ionViewDidLoad();
    }, 1000);
  }

  ionViewDidLoad() {
    this.platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      this.statusBar.styleDefault();
      this.statusBar.show();
      this.statusBar.overlaysWebView(false);
      this.splashScreen.hide();
      this.appVersion.getVersionNumber().then(v=> {
        this.storage.set('version', v);
      }, err => {
         this.storage.set('version', '0');
      });
      this.screenOrientation.lock('portrait-primary').then(val => {}, err=>{});
      this.storage.set('deviceUUID', this.device.uuid);
      this.registerBackButton();
      this.iosStyleInit();
    });
  }

  iosStyleInit() {
    if(this.platform.is('ios')) {
      let titleObj = document.querySelector('.toolbar-title') as HTMLElement;
      let navObj = document.querySelector('.toolbar');
      let h1 = (navObj.clientHeight - titleObj.clientHeight)/2;
      let h2 = titleObj.offsetTop;
      if(h2 > h1 + 2) {
        let cssEl = document.createElement('style');
        document.documentElement.firstElementChild.appendChild(cssEl); 
        cssEl.innerHTML = '.toolbar button .button-inner, ion-title .toolbar-title {padding-bottom: ' + 0.55*(h2 - h1) + 'px;}';
      }
    }
  }

  registerBackButton() {
    this.platform.registerBackButtonAction(() => {
      //处理键盘
      if(this.keyboard.isOpen()) {
        this.keyboard.close();
        return;
      }
      //处理弹窗
      let activePortal = this.app._modalPortal.getActive();
      activePortal = activePortal || this.app._toastPortal.getActive();
      activePortal = activePortal || this.app._loadingPortal.getActive();
      if (activePortal) {
        activePortal.dismiss().catch(() => {});
        activePortal.onDidDismiss(() => {});
        this.onBack.emit(null);
        return;
      }
      activePortal = activePortal || this.app._overlayPortal.getActive();
      if (activePortal) {
        this.onBack.emit(activePortal);
        activePortal.dismiss().catch(() => {});
        return;
      }

      //处理页面
      if(this.nav.canGoBack()) {
        if(this.nav.getActive().instance instanceof UserSettingPage) {
          this.nav.getActive().instance.goBack();
        } else {
          this.nav.pop();
        }
      } else {
        //退出程序
        this.msgBox.confirm('APP_EXIT').then(() => {
          this.platform.exitApp();
        }, () => {}) 
      } 
    })
  }

  langs:Array<string> = ['zh', 'en', 'es', 'id'];

  getBrowserLang(lang) {
    let lans = lang.split('-')[0];
    lans = lans.split('_')[0];
    return this.langs.indexOf(lans) == -1 ? 'en': lans;
  }

  initTranslate() {
   
    this.translate.setDefaultLang('zh');
    this.storage.get('LANG').then(lang => {
      if(lang) {
        this.translate.use(lang);
      } else {
          if (this.translate.getBrowserLang() !== undefined) {
            this.translate.use(this.getBrowserLang(this.translate.getBrowserLang()));
          } else {
            this.translate.use('zh');
          }
      }
    })
    this.config.set('ios', 'backButtonText', '');
    this.config.set('android', 'backButtonText', '');
  }
}
