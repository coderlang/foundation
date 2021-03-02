import {Class, DefaultConstructor, Json} from "utils";
import {DetailModel, DetailModelItem} from "./DetailModel";
import {Table} from "../db/Table";
import {NullTable} from "../db/NullTable";

export abstract class TheDetailModel extends DetailModel {
  protected abstract getItemClazz(): DefaultConstructor<DetailModelItem>;

  protected abstract getTableName(): string;

  private async load<T extends DetailModelItem>(id: string, clazz: DefaultConstructor<T>)
    : Promise<DetailModelItem | null> {

    let [v, err] = await this.table_.get(id);
    if (err) {
      return null;
    }

    let ret;
    [ret, err] = new Json().fromJson(v, clazz);
    if (err) {
      console.error(err)
      return null;
    }

    return ret;
  }

  protected async loadFromDB<T extends DetailModelItem>(ids: string[], clazz: Class<T>): Promise<Map<string, T>> {
    let ret = new Map<string, T>();
    for (let id of ids) {
      let v = await this.load(id, this.getItemClazz());
      if (!v) {
        continue;
      }

      ret.set(id, <T>v);
    }

    return ret;
  }

  protected async loadFromDBForMerge<T extends DetailModelItem>(id: string): Promise<T | null> {
    return (<T>await this.load(id, this.getItemClazz()))
  }

  protected async saveToDB(items: DetailModelItem[]): Promise<void> {
    for (let item of items) {
      if (item.isInvalid()) {
        continue;
      }

      let id = item.getId()!
      let err = await this.table_.set(id, new Json().toJson(item));
      if (err) {
        console.error(`save id(${id}) to db`, item, err)
      }
    }
  }

  protected async getTable():Promise<Table> {
    return new Table(await this.getDBM().getSelfDB(), this.getTableName());
  }

  async init() {
    this.table_ = await this.getTable();
  }

  private table_: Table = new NullTable();
}