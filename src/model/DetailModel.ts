
import {Model, ModelEvent} from "./Model";
import {MergeStrategy} from "./merge/MergeStrategy";
import {JoinMergeStrategy} from "./merge/JoinMergeStrategy";
import { CacheStrategy } from "./cache/CacheStrategy";
import { NoEliminationCacheStrategy } from "./cache/NoEliminationCacheStrategy";
import {Class, Json, nullize} from "utils";
import { SequentiallyRun } from "./SequentiallyRun";

export abstract class DetailModelItem {

  // 下面两个函数，不同的item可以定制，可以认为一个是序列化为object 一个是从object反序列化
  public toObject(): object {
    return this;
  }
  // 通过o新建一个T，并不会改变this的任何值
  public newItem<T extends DetailModelItem>(o: object): T {
    return <T>o
  }

  public deepCopy(from: DetailModelItem):this {
    new Json().parseJsonObjectToClass(this, JSON.parse(new Json().toJson(from)));
    return this;
  }

  public shallowCopy(other: DetailModelItem): void {
    for (let key in other) {
      if (this.hasOwnProperty(key)) {
        (<any>this)[key] = (<any>other)[key];
      }
    }
  }

  public clear():void {
    nullize(this);
  }

  public isInvalid():boolean {
    return this.getId()=== null || this.getId() === "";
  }

  public abstract getId():string|null ;
}

export class DetailModelEvent extends ModelEvent{
  public ids: string[] ;

  constructor(ids:string[]) {
    super();
    this.ids = ids;
  }
}

export abstract class DetailModel extends Model {

  public async set(items: DetailModelItem[]) {
    await this.setImpl(items, new JoinMergeStrategy(), true);
  }

  public onlyClearCache():void {
    this.details_.clear();
    this.cacheStrategy_.clear();
  }

  public async setNoPost (items: DetailModelItem[]) {
    await this.setImpl(items, new JoinMergeStrategy(), false);
  }

  public async setWithStrategy(items: DetailModelItem[], merge: MergeStrategy
    , post: boolean) {
    await this.setImpl(items, merge, post);
  }

  protected async setImpl<T extends DetailModelItem>(items: T[]
    , merge: MergeStrategy, post: boolean) {
    return new Promise(resolve=>{
      this.runner_.Push(async ()=>{
        await this.setImplNotSafe(items, merge, post);
        resolve();
      })
    });
  }

  // 因为是异步执行，可能存在此接口被同一个模型同时调用的情况，
  // 在合并的过程中，就可能不是使用的最新的本地数据，会出现数据覆盖的情况，
  // 所以，此函数只能单次的按序调用。
  // 与多线程有点类似，都可能对数据造成错乱，但是异步仍然是在一个线程执行的，
  // 所以不存在关键区代码保护的问题。
  protected async setImplNotSafe<T extends DetailModelItem>(items: T[]
    , merge: MergeStrategy, post: boolean) {

    if (items === null || items.length === 0) {
      return
    }

    let promises:Promise<T|null>[] = [];
    // 下面这段代码的使用需要后续再考虑，在上次改版时，留下了这段代码，但其实下面的逻辑并没有用到
    // let loadOldFromDb_ = async (id:string, value?: T):
    //   Promise<T|null> => {
    //   if (value !== undefined) {
    //     return value;
    //   }
    //
    //   return (await this.loadFromDBForMerge(id));
    // };

    // find old
    for (let item of items) {
      if (item.isInvalid()) {
        continue;
      }

      let id = item.getId()!;
      let v = this.details_.get(id);
      if (v) {
        promises.push(Promise.resolve(<T>v))
        continue;
      }
      promises.push(this.loadFromDBForMerge(id))
    }
    let olds = new Map<string, T>()
    for (let old of await Promise.all(promises)) {
      if (old !== null && !old.isInvalid()) {
        olds.set(old.getId()!, old)
      }
    }

    // merge
    let newItems:T[] = []
    let changed = false;
    for (let item of items) {
      if (item.isInvalid()) {
        continue;
      }
      let old = olds.get(item.getId()!)
      let oldO: object|null = null
      if (old) {
        oldO = old.toObject()
      }

      let [ret, c] = merge.mergeToOld(oldO, item.toObject());
      newItems.push(item.newItem(ret))
      changed = changed || c;
    }

    await this.saveToDB(newItems);
    // cache adjust
    let ids:string[] = [];
    for (let item of newItems) {
      ids.push(item.getId()!);
    }
    let eimi:string[] = this.cacheStrategy_.adjustCache(ids);
    let eimiSet:Set<string> = new Set<string>(eimi);
    for (let id of eimi) {
      this.details_.delete(id);
    }
    for (let item of newItems) {
      if (eimiSet.has(item.getId()!)) {
        continue;
      }
      this.details_.set(item.getId()!, item);
    }

    if (changed && post) {
      await this.postEvent(ids);
    }
  }

  public async get<T extends DetailModelItem>(ids:string[]
    , clazz:Class<T>):Promise<Map<string, Readonly<T> >> {

    let ret = new Map<string, Readonly<T>>();
    let db:string[] = [];

    for(let id of ids) {
      let value = this.details_.get(id);
      if (value === undefined) {
        db.push(id);
      } else {
        ret.set(id, <T>value);
      }
    }

    if (db.length === 0) {
      return ret;
    }

    let items = await this.loadFromDB(db, clazz)
    for (let entry of items) {
      ret.set(entry[0], entry[1]);
    }

    let eimi = this.cacheStrategy_.adjustCache([...items.keys()]);
    let eimiSet = new Set<string>(eimi);
    for (let id of eimi) {
      this.details_.delete(id);
    }

    for (let entry of items) {
      if (eimiSet.has(entry[0])) {
        continue;
      }
      this.details_.set(entry[0], entry[1]);
    }

    return ret
  }

  // --------  DB ----------

  protected abstract async saveToDB(items: DetailModelItem[]):Promise<void>;

  protected abstract async loadFromDB<T extends DetailModelItem>(ids:string[]
    , clazz:Class<T>): Promise<Map<string, T> >;

  protected abstract async loadFromDBForMerge<T extends DetailModelItem>(id:string): Promise<T|null>;

  // ------------------------

  protected setCacheStrategy(cache: CacheStrategy<string>) {
    this.cacheStrategy_ = cache;
  }

  public async postEvent(ids: string[]) {
    await this.getPlugin().nc().post(this.getSubEvent(ids));
  }

  protected abstract getSubEvent(ids:string[]):DetailModelEvent;

  private details_:Map<string, DetailModelItem> = new Map();

  private cacheStrategy_: CacheStrategy<string> = new NoEliminationCacheStrategy<string>();

  private runner_:SequentiallyRun = new SequentiallyRun();
}


