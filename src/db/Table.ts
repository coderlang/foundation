import {DB} from "./DB";


export class Table {

  public async get(key:string):Promise<[string, Error|null]> {
    return (await this.db_.get(this.getFullKey(key)));
  }

  public async set(key:string, value:string):Promise<Error|null> {
    return (await this.db_.set(this.getFullKey(key), value));
  }

  public async remove(key:string):Promise<Error|null> {
    return (await this.db_.remove(this.getFullKey(key)));
  }

  private getFullKey(key:string):string {
    return this.name_ + "." + key;
  }

  public constructor(db:DB, name:string) {
    this.db_ = db;
    this.name_ = name;
  }

  private readonly name_:string;
  private db_:DB;
}