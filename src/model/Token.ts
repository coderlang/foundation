

import {Model} from "./Model";
import {Table} from "../db/Table";
import {NullTable} from "../db/NullTable";

export class Token extends Model{
  public static readonly empty = "";

  public async get(url:string):Promise<string> {
    let token:string|undefined|null = this.tokens_.get(url);

    if (token === undefined || token === null) {
      let [t, err] = await this.table_.get(url)
      if (!err) {
        token = t
        this.tokens_.set(url, t)
      } else {
        token = Token.empty;
      }
    }

    return token;
  }

  public async set(url:string, token:string) {
    this.tokens_.set(url, token);
    await this.table_.set(url, token);
  }

  public async clear(url:string) {
    this.tokens_.delete(url);
    await this.table_.remove(url);
  }

  async init() {
    this.table_ = new Table(await this.getDBM().getSelfDB(), "Token");
  }

  private table_:Table = new NullTable();
  private tokens_ = new Map<string, string>();
}
