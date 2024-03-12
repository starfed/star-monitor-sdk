import { Core, Breadcrumb } from '@star-monitor-sdk/core';
import { IAnyObject, PlatformTypes, BrowserReportType } from '@star-monitor-sdk/types';
import { formatDate, generateUUID, beacon, get, imgRequest, post } from '@star-monitor-sdk/utils';
import { BrowserOptionsType, BrowserReportPayloadDataType } from './types';
import { nextTick } from './lib/nextTick';
// 基础插件
import jsErrorPlugin from './plugins/jsError';
import promiseErrorPlugin from './plugins/promiseError';
import lifeCyclePlugin from './plugins/lifeCycle';

class BrowserClient extends Core<BrowserOptionsType> {
  private readonly breadcrumb: Breadcrumb<BrowserOptionsType>;
  protected sessionID: string;

  constructor(options: BrowserOptionsType) {
    super(options);
    this.breadcrumb = new Breadcrumb(options);
  }

  async initAPP() {
    const { initUrl, app } = this.context;
    const ctime = formatDate();
    const params = {
      id: generateUUID(),
      ...app,
      ctime
    };
    const { data } = await this.report(initUrl, params, BrowserReportType.GET);
    const { id = '' } = data || {};
    return id;
  }

  isRightEnv() {
    return typeof window !== 'undefined';
  }

  report(url: string, data: IAnyObject, type: BrowserReportType = BrowserReportType.BEACON) {
    if (type === BrowserReportType.BEACON && navigator.sendBeacon) {
      beacon(url, data);
      return;
    }
    if (type === BrowserReportType.IMG || !navigator.sendBeacon) {
      imgRequest(url, data);
      return;
    }
    if (type === BrowserReportType.POST) {
      post(url, data);
      return;
    }
    return get(url, data);
  }

  transform(datas: IAnyObject): BrowserReportPayloadDataType {
    if (!datas) {
      return null;
    }
    const { userAgent, language } = navigator;
    const { title } = document;
    const { href } = location;
    return {
      session_id: this.sessionID, // 会话id
      platform: PlatformTypes.BROWSER,
      page_title: title, // 页面标题
      path: href, // 页面路径
      language, // 站点语言
      user_agent: userAgent, // 浏览器标识
      ...datas
    };
  }

  nextTick(cb: Function, ctx: Object, ...args: any[]) {
    return nextTick(cb, ctx, ...args);
  }
}

const init = (options: BrowserOptionsType) => {
  const client = new BrowserClient(options);
  const { plugins = [] } = options;
  client.use([jsErrorPlugin, promiseErrorPlugin, lifeCyclePlugin.call(client, options), ...plugins]);
};

export default init;
