import {Table} from "./Table";
import {DB} from "./DB";
import {Storage} from "./Storage";

class nullS implements Storage{
  get(key: string): Promise<[string, Error | null]> {
    throw new Error("null storage")
  }

  remove(key: string): Promise<Error | null> {
    throw new Error("null storage")
  }

  set(key: string, value: string): Promise<Error | null> {
    throw new Error("null storage")
  }

}

export class NullTable extends Table{
  public get(key:string):Promise<[string, Error | null]> {
    throw new Error("get error!---invalid table");
  }

  public set(key:string, value:string):Promise<Error | null> {
    throw new Error("set error!---invalid table");
  }

  public remove(key:string):Promise<Error | null> {
    throw new Error("remove error!---invalid table");
  }

  constructor() {
    super(new DB(new nullS(), "") , "");
  }
}