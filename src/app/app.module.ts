import { NgModule, ErrorHandler } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpModule, Http } from '@angular/http';
import { IonicApp, IonicModule, IonicErrorHandler } from 'ionic-angular';
import { Storage, IonicStorageModule } from '@ionic/storage';

import { MyApp } from './app.component';

// import pages
import { HomePage } from '../pages/base/home/home';
import { LoginPage } from '../pages/base/login/login';
import { NetworkPage } from '../pages/base/network/network';
import { RegisterPage } from '../pages/base/register/register';
import { ForgetPage } from '../pages/base/forget/forget';
import { PersListPage } from '../pages/pers/persList/persList';
import { PersAddPage } from '../pages/pers/persAdd/persAdd';
import { PersAccLevelPage } from '../pages/pers/persAccLevel/persAccLevel';
import { PersDeptPage } from '../pages/pers/persDept/persDept';
import { PersSetPage } from '../pages/pers/persSet/persSet';
import { PersPhotoEditPage } from '../pages/pers/persPhotoEdit/persPhotoEdit';

import { AttInfoPage } from '../pages/att/attInfo/attInfo';
import { AttReportPage } from '../pages/att/attReport/attReport';
import { AttDevicePage } from '../pages/att/attDevice/attDevice';
import { AttWaitPage } from '../pages/att/attWait/attWait';
import { AttApplyPage } from '../pages/att/attApply/attApply';
import { AttSignPage } from '../pages/att/attSign/attSign';
import { AttMinePage } from '../pages/att/attMine/attMine';
import { AttPunchPage } from '../pages/att/attPunch/attPunch';
import { AttLeavePage } from '../pages/att/attLeave/attLeave';
import { AttWaitDetailPage } from '../pages/att/attWaitDetail/attWaitDetail';
import { AttApplyInfoPage } from '../pages/att/attApplyInfo/attApplyInfo';
import { BaseSetPage } from '../pages/base/baseSet/baseSet';
import { BaseCompanyPage } from '../pages/base/baseCompany/baseCompany';
import { BaseInfoPage } from '../pages/base/baseInfo/baseInfo';
import { ChangePassPage } from '../pages/base/changePass/changePass';

// report
import { AttSexReportPage } from '../pages/att/attSexReport/attSexReport';
import { AttEarlyReportPage } from '../pages/att/attEarlyReport/attEarlyReport';
import { AttLateReportPage } from '../pages/att/attLateReport/attLateReport';
import { AttOvertimeReportPage } from '../pages/att/attOvertimeReport/attOvertimeReport';
import { AttAttendReportPage } from '../pages/att/attAttendReport/attAttendReport';
import { AttInoutReportPage } from '../pages/att/attInoutReport/attInoutReport';

import { UserSettingPage } from '../pages/base/userSetting/userSetting';
import { UserDetailPage } from '../pages/base/userDetail/userDetail';
import { AboutPage } from '../pages/base/about/about';
import { StatementPage } from '../pages/base/statement/statement';
import { PersSelectDeptPage } from '../pages/pers/persSelectDept/persSelectDept';
import { PersPhotoPage } from '../pages/pers/persPhoto/persPhoto';
import { ZkIcon } from '../pages/base/zkIcon/zkIcon';
import { ZkTree } from '../pages/base/zkTree/zkTree';
import { ZkNavBar } from '../pages/base/zkNavBar/zkNavBar';
import { ArrowAnimation } from '../pages/base/arrowAnimation/arrowAnimation';

import { Settings } from '../providers/settings';
import { HttpService } from '../providers/http-service';
import { ZKMessage } from '../providers/zk-message';
import { MessageBox } from '../providers/message-box';
import { ZkMenus } from '../providers/menus';
import { Utils } from '../providers/utils';
import { BaseCode } from '../providers/basecode';
import { CommonValidator } from '../providers/common-validator';
import { Properties } from '../providers/properties';
import { StringFormat } from '../filter/stringformat';
import { ParkState } from '../filter/parkstate';
import { ChargeType } from '../filter/chargetype';
import { Session } from '../providers/session';
import { ImageUtils } from '../providers/image-utils';
import { Md5 } from 'ts-md5/dist/md5';

import { Camera } from '@ionic-native/camera';
import { SplashScreen } from '@ionic-native/splash-screen';
import { StatusBar } from '@ionic-native/status-bar';
import { Device } from '@ionic-native/device';
import { BarcodeScanner } from '@ionic-native/barcode-scanner';
import { AppVersion } from '@ionic-native/app-version';
import { ImagePicker } from '@ionic-native/image-picker';
import { ScreenOrientation } from '@ionic-native/screen-orientation';
import { CallNumber } from '@ionic-native/call-number';
import { SMS } from '@ionic-native/sms';
import { Geolocation } from '@ionic-native/geolocation';

import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';

import { MultiPickerModule } from 'ion-multi-picker';

// The translate loader needs to know where to load i18n files
// in Ionic's static asset pipeline.
export function HttpLoaderFactory(http:Http) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

export function provideSettings(storage:Storage) {
  /**
   * The Settings provider takes a set of default settings for your app.
   *
   * You can add new settings options at any time. Once the settings are saved,
   * these values will not overwrite the saved values (this can be done manually if desired).
   */
  return new Settings(storage, {
    option1: true,
    option2: 'Ionitron J. Framework',
    option3: '3',
    option4: 'Hello'
  });
}

@NgModule({
  declarations: [
    MyApp,
    StringFormat,
    ParkState,
    ChargeType,
    LoginPage,
    NetworkPage,
    HomePage,
    RegisterPage,
    PersListPage,
    PersAddPage,
    PersAccLevelPage,
    AttPunchPage,
    AttApplyInfoPage,
    PersDeptPage,
    PersSetPage,
    AttLeavePage,
    ForgetPage,
    AttSexReportPage,
    AttEarlyReportPage,
    AttLateReportPage,
    AttOvertimeReportPage,
    AttAttendReportPage,
    AttInoutReportPage,
    PersPhotoEditPage,
    AttInfoPage,
    AttReportPage,
    AttDevicePage,
    ChangePassPage,
    AttWaitPage,
    AttApplyPage,
    AttSignPage,
    AttMinePage,
    AttWaitDetailPage,
    BaseSetPage,
    BaseCompanyPage,
    BaseInfoPage,
    UserSettingPage,
    UserDetailPage,
    ZkIcon,
    ArrowAnimation,
    ZkTree,
    ZkNavBar,
    AboutPage,
    StatementPage,
    PersSelectDeptPage,
    PersPhotoPage,
    StatementPage,
    PersSelectDeptPage
  ],
  imports: [
    BrowserModule,
    HttpModule,
    MultiPickerModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [Http]
      }
    }),
    IonicModule.forRoot(MyApp,{backButtonIcon:'ios-arrow-back',mode:'ios', spinner: 'crescent'}),
    IonicStorageModule.forRoot()
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    LoginPage,
    HomePage,
    PersListPage,
    PersAddPage,
    PersAccLevelPage,
    PersPhotoEditPage,
    NetworkPage,
    RegisterPage,
    PersDeptPage,
    AttApplyInfoPage,
    AttPunchPage,
    AttInfoPage,
    ChangePassPage,
    AttReportPage,
    AttDevicePage,
    AttWaitPage,
    AttLeavePage,
    AttApplyPage,
    AttSexReportPage,
    AttEarlyReportPage,
    AttLateReportPage,
    AttOvertimeReportPage,
    AttAttendReportPage,
    AttInoutReportPage,
    AttSignPage,
    AttMinePage,
    BaseSetPage,
    AttWaitDetailPage,
    BaseCompanyPage,
    BaseInfoPage,
    ForgetPage,
    PersSetPage,
    UserSettingPage,
    UserDetailPage,
    ZkIcon,
    ArrowAnimation,
    ZkNavBar,
    ZkTree,
    AboutPage,
    StatementPage,
    PersSelectDeptPage,
    StatementPage,
    PersSelectDeptPage,
    PersPhotoPage
  ],
  providers: [
    HttpService,
    ZKMessage,
    ZkMenus,
    Utils,
    MessageBox,
    BaseCode,
    ImagePicker,
    ImageUtils,
    Md5,
    Properties,
    CommonValidator,
    Camera,
    SplashScreen,
    Geolocation,
    Device,
    BarcodeScanner,
    StatusBar,
    Session,
    ScreenOrientation,
    SMS,
    CallNumber,
    AppVersion,
    {provide: Settings, useFactory: provideSettings, deps: [Storage]},
    // Keep this to enable Ionic's runtime error handling during development
    {provide: ErrorHandler, useClass: IonicErrorHandler}
  ]
})
export class AppModule {
}
