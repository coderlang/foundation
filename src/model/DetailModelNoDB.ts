
import {Class} from "utils";
import {DetailModel, DetailModelItem} from "./DetailModel";

export abstract class DetailModelNoDB extends DetailModel {

  // --------  DB ----------

  protected async saveToDB(items: DetailModelItem[]):Promise<void> {
  }

  protected async loadFromDB<T extends DetailModelItem>(ids:string[]
    , clazz:Class<T>): Promise<Map<string, T> > {
    return new Map<string, T>();
  }

  protected async loadFromDBForMerge<T extends DetailModelItem>(id:string): Promise<T|null> {
    return null
  }

}
