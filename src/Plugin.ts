import {ModelFactory} from "./model/ModelFactory";
import {Net} from "./net/Net";
import {NotificationCenter} from "./nc/NotificationCenter";
import {DBManager} from "./db/DBManager";
import {NullDBManager} from "./db/NullDBManager";


export class Plugin {
  private constructor(name:string){
    this.nc_ = new NotificationCenter(this);
    this.mf_ = new ModelFactory(this);
    this.dbManager_ = new NullDBManager(this);
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

  public getMainNet():Net {
    if (this.mainNet_ === null) {
      throw new Error("main net has not set!");
    }
    return this.mainNet_;
  }

  public setMainNet(net: Net):void {
    if (this.mainNet_ === null) {
      this.mainNet_ = net;
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
  private mainNet_:Net|null = null;
  private dbManager_:DBManager;
}

