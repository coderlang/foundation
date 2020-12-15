
import {Event} from "../nc/Event"
import {Plugin} from "../Plugin"
import {DBManager} from "../db/DBManager";

export class ModelEvent extends Event{
}

export interface ModelClazz<T> {
  new(plugin:Plugin):T;
  readonly prototype:T;
}

export class Model {
  private readonly plugin_: Plugin;

  public constructor(plugin:Plugin) {
    this.plugin_ = plugin;
  }

  protected getPlugin():Plugin {
    return  this.plugin_;
  }

  protected getDBM():DBManager {
    return this.plugin_.dbManager();
  }

  public async init():Promise<void> {}
  public async willDeInit():Promise<void> {}

  public needClearWhenUidChanged():boolean {
    return true;
  }
}
