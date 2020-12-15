import {DB} from "./DB";
import {Storage} from "./Storage";

// 垃圾桶DB  是一个合法的DB 只是所有的内容都直接丢弃并获取不到任何数据

export class NullDB extends DB {
  public async get(key:string):Promise<[string, Error|null]> {
    return ["", Error("no data")];
  }

  public async set(key:string, value:string):Promise<Error|null> {
    return null;
  }

  public async remove(key:string):Promise<Error|null> {
    return null;
  }

  constructor(storage:Storage) {
    super(storage, "");
  }
}