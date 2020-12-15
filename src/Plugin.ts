
import {ModelFactory} from "./model/ModelFactory";
import {Net} from "./net/Net";
import {NotificationCenter} from "./nc/NotificationCenter";
import {DBManager} from "./db/DBManager";
import {WXDBManager} from "./db/WXDBManager";


// const sym:symbol = Symbol("some plugin");

export class Plugin {
  private constructor(name:string){
    this.nc_ = new NotificationCenter(this);
    this.mf_ = new ModelFactory(this);
    // 默认使用 WXDBManager
    this.dbManager_ = new WXDBManager(this);
    this.name_ = name;
  }

  public static register(name:string):void {
    let p = Plugin.allPlugins.get(name);
    if (p) {
      throw new Error("plugin error: " + name + " has been registered");
    }

    p = new Plugin(name);
    Plugin.allPlugins.set(name, p);
  }

  public static getBy(name: string):Plugin {
    let p = Plugin.allPlugins.get(name);
    if (p === undefined) {
      throw new Error("plugin error: " + name + " has NOT been registered");
    }

    return p;
  }

  public getName():string {
    return this.name_;
  }

  public nc():NotificationCenter {
    return this.nc_;
  }

  public mf():ModelFactory {
    return this.mf_;
  }

  public dbManager():DBManager {
    return this.dbManager_!;
  }

  public setDBManager(dbm: DBManager) {
    this.dbManager_ = dbm
  }

  public net(baseUrl:string):Net {
    let net = this.nets_.get(baseUrl);

    if (net === undefined) {
      net = new Net(this, baseUrl);
      this.nets_.set(baseUrl, net);
    }

    return net;
  }

  public getMainNet():Net {
    if (this.mainNet_ === null) {
      throw new Error("main net has not set!");
    }
    return this.mainNet_;
  }

  public setMainNet(net: Net):void {
    if (this.mainNet_ === null) {
      this.mainNet_ = net;
      // 主网络必须包含于nets集合中，所以这里无论设置的主网络是否在nets中，直接再加入一次
      this.nets_.set(net.getBaseUrl(), net);
      return;
    }

    if (this.mainNet_ !== net) {
      throw new Error("duplicate main net!");
    }
  }

  private static allPlugins = new Map<string, Plugin>();

  private readonly name_:string;
  private readonly nc_:NotificationCenter;
  private readonly mf_:ModelFactory;
  private nets_:Map<string, Net> = new Map<string, Net>();
  private mainNet_:Net|null = null;
  private dbManager_:DBManager;
}

