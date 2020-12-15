import {Plugin} from "../Plugin";
import {Token} from "../model/Token";
import {HttpBuilder} from "./http/HttpBuilder";

/**
 * 401 表示net层不通，连通net层的方法常常是 login
 */
export class Net {
  public constructor(plugin: Plugin, baseUrl: string) {
    this.plugin_ = plugin;
    this.baseUrl_ = baseUrl;
  }

  // 连续的多次401，只处理一次
  process401():void {
    if (this.has401_) {
      return
    }
    this.has401_ = true
    this.net401Delegate_(this)
  }

  set401Delegate(net401Delegate: ((net: Net) => void)): void {
    this.net401Delegate_ = net401Delegate;
  }

  is401(): boolean {
    return this.has401_;
  }

  // 通常清除401的场景：1、任何需要token的接口，非401返回时；2、登录成功时(给net设置有效的token值)；3、业务其他逻辑主动清除
  public clear401(): void {
    this.has401_ = false
  }

  public getBaseUrl(): string {
    return this.baseUrl_;
  }

  // 每次获取builder时，在net层都应该调用生成函数生成一个builder 而不能在net层直接缓存一个builder直接返回
  // 对于http等无状态的请求，每次都应该是一个全新的builder 而对于其他类型的协议，有可能不是每次都是全新的一个builder
  // 具体如何生成，应该是creator的责任，而不是net来负责，net负责的是会话级别的连接，builder负责的是具体的协议
  public setHttpBuilderCreator(creator: (baseUrl: string) => HttpBuilder): void {
    this.creator_ = creator
  }

  getHttpBuilder(): HttpBuilder {
    return this.creator_(this.baseUrl_);
  }

  async setToken(token: string) {
    if (token !== Token.empty) {
      this.clear401()
    }
    // this.token_ = token;
    await (await this.plugin_.mf().getModel(Token)).set(this.baseUrl_, token);
  }

  async getToken(): Promise<string> {
    return (await (await this.plugin_.mf().getModel(Token)).get(this.baseUrl_));

    // // 优先读取缓存token 防止最近一次set的token还没有落地而读取错误，见setToken中的说明
    // if (this.token_ === null) {
    //   this.token_ = await (await this.plugin_.mf().getModel(Token)).get(this.baseUrl_);
    // }
    //
    // return this.token_;
  }

  async clearToken() {
    // this.token_ = null;
    await (await this.plugin_.mf().getModel(Token)).clear(this.baseUrl_);
  }

  setToMainNet(): this {
    this.plugin_.setMainNet(this);
    this.mainNet_ = true;
    return this;
  }

  isMainNet(): boolean {
    return this.mainNet_;
  }

  public getPlugin(): Plugin {
    return this.plugin_;
  }

  // private token_: string | null = null;
  private has401_: boolean = false;
  private creator_: (baseUrl: string) => HttpBuilder = (headerAPIKey:string): HttpBuilder => {
    throw new Error("Please setHttpBuilderCreator");
  };

  private readonly plugin_: Plugin;
  private readonly baseUrl_: string;
  private mainNet_ = false;
  private net401Delegate_: ((net: Net) => void) = ((net: Net) => {
  });
}
