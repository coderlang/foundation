import {Model} from "./Model";
import {Table} from "../db/Table";
import {NullTable} from "../db/NullTable";


export class DeviceModel extends Model{

  public async getUUID():Promise<string> {
    if (this.uuid_ != null) {
      return this.uuid_;
    }

    this.uuid_ = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
      /[xy]/g, function(c) {
      var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
      return v.toString(16);
    });

    await this.table_.set(DeviceModel.UUIDStr, this.uuid_);

    return this.uuid_;
  }

  private static readonly UUIDStr = "UUID";


  async init() {
    this.table_ = new Table(this.getDBM().getShareDBAtLocalStorage(), "Device");
    let [uuid, err] = await this.table_.get(DeviceModel.UUIDStr);
    if (err === null) {
      this.uuid_ = uuid
    }
  }

  private table_:Table = new NullTable();
  private uuid_:string|null = null;

}

