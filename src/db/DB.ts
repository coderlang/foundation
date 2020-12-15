

import {Storage} from "./Storage";

export class DB {
  public async get(key:string):Promise<[string, Error|null]> {
    return (await this.storage_.get(this.getFullKey(key)));
  }

  public async set(key:string, value:string):Promise<Error|null> {
    return (await this.storage_.set(this.getFullKey(key), value));
  }

  public async remove(key:string):Promise<Error|null> {
    return (await this.storage_.remove(this.getFullKey(key)));
  }

  private getFullKey(key:string):string{
    return this.name_ + "." + key;
  }

  constructor(storage:Storage, name:string) {
    this.name_ = name;
    this.storage_ = storage;
  }

  private storage_:Storage;
  private readonly name_:string;
}