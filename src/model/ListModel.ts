import {Model, ModelEvent} from "./Model";
import {MergeStrategy} from "./merge/MergeStrategy";
import {OverWriteMergeStrategy} from "./merge/OverWriteMergeStrategy";
import {Table} from "../db/Table";
import {NullTable} from "../db/NullTable";
import {SequentiallyRun} from "./SequentiallyRun";

export class ListModelEvent extends ModelEvent {
  public listKey: string;

  constructor(listKey: string) {
    super();
    this.listKey = listKey;
  }
}

export class ListModel extends Model {

  public async get(key: string): Promise<string[]|null> {
    let value = this.list_.get(key);
    if (value !== undefined) {
      return value;
    }

    let [val, err] = await this.table_.get(key);
    if (err) {
      return null;
    }

    value = JSON.parse(val);
    if (value === null || value === undefined) {
      return null
    }
    this.list_.set(key, value);

    return value;
  }

  public async set(key: string, list: string[]): Promise<void> {
    await this.setWithStrategy(key, list, new OverWriteMergeStrategy(), true);
  }

  public async add(key: string, value:string):Promise<void> {
    let list = await this.get(key);
    if (list===null) {
      list = [value];
    }

    list = [...list, value];

    await this.set(key, list);
    return ;
  }

  public async remove(key:string, value:string):Promise<void> {
    let list = await this.get(key);
    if (list===null) {
      return ;
    }

    list = list.filter((id) => id !== value);

    await this.set(key, list);
    return ;
  }

  public async setNoPost(key: string, list: string[]): Promise<void> {
    await this.setWithStrategy(key, list, new OverWriteMergeStrategy(), false);
  }

  public async setWithStrategy(key: string, list: string[]
    , merge: MergeStrategy, post: boolean) {
    return new Promise(resolve=>{
      this.runner_.Push(async ()=>{
        await this.setWithStrategyNotSafe(key, list, merge, post);
        resolve();
      })
    });
  }

  // 同 DetailModel
  public async setWithStrategyNotSafe(key: string, list: string[]
    , merge: MergeStrategy, post: boolean) {

    let old: string[]|null = await this.get(key);
    let changed: boolean = false;
    if (old === null) {
      changed = true;
      old = [];
    }

    let ret: boolean = merge.mergeToOldArray(old, list);
    changed = changed || ret;

    this.list_.set(key, old!);

    await this.table_.set(key, JSON.stringify(old))

    if (changed && post) {
      await this.getPlugin().nc().post(new ListModelEvent(key));
    }
  }

  async init(): Promise<void> {
    this.table_ = new Table(await this.getDBM().getSelfDB(), "List");
  }

  private list_: Map<string, string[]> = new Map();
  private table_: Table = new NullTable();
  private runner_ = new SequentiallyRun();
}
