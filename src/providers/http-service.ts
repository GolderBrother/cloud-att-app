import { Injectable } from '@angular/core';
import { Http, RequestOptions, Headers, URLSearchParams } from '@angular/http';
import { Storage } from '@ionic/storage';
import { ZKMessage } from './zk-message';
import { Utils } from './utils';
import { Session } from './session';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/timeout';
import 'rxjs/add/operator/catch';
import { Observable } from 'rxjs/Observable';

/**
 * Api is a generic REST Api handler. Set your API url first.
 */
@Injectable()
export class HttpService {
  //url: string = 'http://192.168.214.28:5588';
  url: string = 'http://110.80.38.74:5577';
  access_token: string = "";
  appId: string = '';
  customerId: string = '';
  private ingoreURI: Array<string> = ['token/login', 'register/getCompanyInfo', 'register/saveUserPic', 'register/saveUser', 'sendMsg/valid'];

  private isIngoreURI(uri: string): boolean {
    let isIngore = false;
    this.ingoreURI.forEach(item => {
      if (isIngore) {
        return;
      }
      if (uri.indexOf(item) !== -1) {
        isIngore = true;
      }
    })
    return isIngore;
  }

  private appendToken(endpoint: string): string {
    if (this.isIngoreURI(endpoint)) {
      return endpoint
    }
    endpoint = `${endpoint}${endpoint.includes('?') ? '&' : '?'}access_token=${this.access_token}`;
    return endpoint;
  }

  success: any = "ok";

  constructor(public http: Http, public storage: Storage, public session: Session, public zkmessage: ZKMessage, public utils: Utils) {
    this.initToken();
  }

  delConfirm(msg: string = 'COMMON_DEL_MSG'): Promise<any> {
    return new Promise((resolve) => {
      this.utils.msgBox.confirm(msg).then(() => {
        resolve();
      }, err => { });
    });
  }

  createURL(method: string) {
    /* var path = "method=" + method + "&app_id="+this.app_id+"&format=json&v=2.0&timestamp="+new Date().getTime();
    return this.url + path; */
  }

  initToken() {
    /*  this.storage.get('SERVER').then(server=> {
       if(server && server['address']) {
           this.url = server.address;
           this.defParams.regCode = server.barcode;
       }
       this.storage.get('USER').then(user => {
         if(user && user['username']) {
            this.defParams.token = user.token;
           } 
       }, err => {})
     }, err=>{}) */
  }

  resetToken() {
    this.utils.userCallback().then((u: { user?: { token?: string }, server?: { address?: string, barcode?: string } }) => {
      if (u.user) {
        u.user.token = '';
      }
      this.storage.set('USER', u.user);
    }, err => { })
  }

  private _getURL(endpoint: string, query?: Object) {
    endpoint = this.appendToken(endpoint);
    // if(query) {
    //   let q = new URLSearchParams();
    //   for (let k in query) {
    //     q.set(k, query[k]);
    //   }
    //   console.log(q);
    //   endpoint += q;
    // }
    if (endpoint.indexOf('http') === 0 || this.url === '') {
      return endpoint;
    } else {
      if (this.url.indexOf('http') === -1) {
        return 'https://' + this.url + '/' + endpoint;
      }
      return this.url + '/' + endpoint;
    }
    //return this.createURL(endpoint);
  }

  /**
   * 设置服务器路径
   * @param {[type]} u:string 服务器路径
   */
  setUrl(u: string) {
    this.url = u;
  }

  /**
   * GET请求
   * @param  {[type]} endpoint:     string         请求路径
   * @param  {[type]} params?:      any            请求参数
   * @param  {[type]} hideLoading?: boolean        隐藏处理消息提示框
   * @param  {[type]} options?:     RequestOptions 请求配置
   * @return {[type]}               Promise
   */
  get(endpoint: string, params?: any, hideLoading?: boolean, timeoutNum: number = 15000, options?: RequestOptions, timeoutTip?: boolean) {
    if (!options) {
      options = new RequestOptions();
    }

    if (params) {
      Object.assign(params, {});
    } else {
      params = {};
    }

    // Support easy query params for GET requests
    if (params) {
      let p = new URLSearchParams();
      for (let k in params) {
        p.set(k, params[k]);
      }
      // Set the search field if we have params and don't already have
      // a search field set in options.
      options.search = !options.search && p || options.search;
    }

    return new Promise((resolve, reject) => {
      if (!hideLoading) {
        this.zkmessage.loading();
      }
      this.http.get(this._getURL(endpoint), options).timeout(timeoutNum).map(res => {
        var _res = res.json();
        return (typeof (_res) == "string" ? JSON.parse(_res) : _res) || {};
      }).catch(err => {
        if (err['name'] == 'TimeoutError') {
          if (!timeoutTip) {
            this.utils.message.closeMessage();
            setTimeout(() => {
              this.utils.message.error('NETWORK_TIMEOUT', 3000);
            }, 500);
          }
          err['message'] = '501';
          err['ret'] = '501';
          return Observable.of<any>(err);
        } else if (err['status'] === 0) {
          if (!timeoutTip) {
            this.utils.message.closeMessage();
            setTimeout(() => {
              this.utils.message.error('NETWORK_CLOSE', 3000);
            }, 500);
          }
          err['message'] = '502';
          err['ret'] = '502';
          return Observable.of<any>(err);
        } else {
          return Observable.throw(err);
        }
      }).subscribe(resp => {
        resolve(resp);
        if (!hideLoading) {
          this.zkmessage.closeMessage();
        }
      }, err => {
        reject(err);
        if (!hideLoading) {
          this.zkmessage.closeMessage();
        }
      });
    });
  }

  /**
   * POST请求
   * @param  {[type]} endpoint:     string         请求路径
   * @param  {[type]} body:         any            请求体
   * @param  {[type]} hideLoading?: boolean        隐藏处理消息提示框
   * @param  {[type]} options?:     RequestOptions 请求配置
   * @return {[type]}               Promise
   */
  post(endpoint: string, body: any, hideLoading?: boolean, timeoutNum: number = 15000, options?: RequestOptions, timeoutTip?: boolean) {

    return new Promise((resolve, reject) => {
      this.session.session(endpoint).then(() => {
        if (!options) {
          let headers = new Headers({ 'Content-Type': 'application/json' });
          options = new RequestOptions({ headers: headers });
        }
        if (body) {
          Object.assign(body, {});
        } else {
          body = {};
        }
        if (!hideLoading) {
          this.zkmessage.loading();
        }
        this.http.post(this._getURL(endpoint), body, options).timeout(timeoutNum).map(res => {
          var _res = res.json();
          return (typeof (_res) == "string" ? JSON.parse(_res) : _res) || {};
        }).catch(err => {
          if (err['name'] == 'TimeoutError') {
            if (!timeoutTip) {
              this.utils.message.closeMessage();
              setTimeout(() => {
                this.utils.message.error('NETWORK_TIMEOUT', 3000);
              }, 500);
            }
            err['message'] = '501';
            err['ret'] = '501';
            return Observable.of<any>(err);
          } else if (err['status'] === 0) {
            if (!timeoutTip) {
              this.utils.message.closeMessage();
              setTimeout(() => {
                this.utils.message.error('NETWORK_CLOSE', 3000);
              }, 500);
            }
            err['message'] = '502';
            err['ret'] = '502';
            return Observable.of<any>(err);
          } else {
            return Observable.throw(err);
          }
        }).subscribe(resp => {
          resolve(resp);
          if (!hideLoading) {
            this.zkmessage.closeMessage();
          }
        }, err => {
          reject(err);
          if (!hideLoading) {
            this.zkmessage.closeMessage();
          }
        });
      });
    });
  }
}
