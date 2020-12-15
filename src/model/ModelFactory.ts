

import {Model, ModelClazz} from "./Model";

import {Plugin} from "../Plugin";
import {LibraryShouldReInitByUidChanged} from "./Me";

export class ModelFactory {

  private readonly plugin_:Plugin;
  private readonly factory_:symbol;
  private models_ = new Map<symbol, Model>();

  public constructor(plugin: Plugin) {
    this.plugin_ = plugin;
    this.factory_ = Symbol("factory");

    plugin.nc().register(this, LibraryShouldReInitByUidChanged
      , async (event):Promise<void> => {
      await this.clearOnUidChanged();
    })
  }

  public async getModel<T extends Model>(modelClazz: ModelClazz<T>): Promise<T>{
    let id:symbol|undefined = (<any>modelClazz)[this.factory_];
    if (id === undefined) {
      id = Symbol("modelID");
      (<any>modelClazz)[this.factory_] = id;
    }
    let model:Model|undefined = this.models_.get(id);
    if (model === undefined) {
      model = new modelClazz(this.plugin_);
      await model.init();
      this.models_.set(id, model);
    }

    return <T>model;
  }

  private async clearOnUidChanged() {
    let willDeleteIDs:symbol[] = [];
    for (let [id, model] of this.models_) {
      if (model.needClearWhenUidChanged()) {
        willDeleteIDs.push(id);
      }
    }

    for (let id of willDeleteIDs) {
      let model:Model|undefined = this.models_.get(id);
      if (model !== undefined) {
         await model.willDeInit();
      }
      this.models_.delete(id);
    }
  }

}
