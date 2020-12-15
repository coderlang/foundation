import {Model, ModelEvent} from "./Model";
import {Table} from "../db/Table";
import {NullTable} from "../db/NullTable";

// 库的重新初始化，基础模块需要监听此事件，作初始化操作,
// 此事件不应该做业务调用或者调用其他初始模块，可能被调用者还没初始化成功
export class LibraryShouldReInitByUidChanged extends ModelEvent {}

// 定义 AppInvalidEvent 与 AppReValidEvent 供上层业务使用，
// 这两个事件往往与Me的对应操作相关联，所以定义在此文件中，
// 执行了 InValidate 常常需要发 AppInvalidEvent 事件，但是并不在 InValidate 操作中发出，
// 在实际发通知的地方，除了 Me.InValidate 外，还有其他操作执行后才能发通知
// AppReValidEvent 与 ReValidateWithUid 类似
export class AppInvalidEvent extends ModelEvent {}
export class AppReValidEvent extends ModelEvent {}

export class Me extends Model{
  private uid_:string|null = null;
  private table_:Table = new NullTable();

  private static readonly uidStr = "uid";

  public static readonly empty:string = "";

  public static isValidUid(uid:string):boolean {
    return uid !== Me.empty
  }

  public async InValidate(): Promise<Error | null> {
    return (await this.setUid(Me.empty))
  }

  public async ReValidateWithUid(uid:string): Promise<Error | null> {
    if (!Me.isValidUid(uid)) {
      return Error("uid("+ uid +") is invalid.");
    }
    return (await this.setUid(uid))
  }

  private async setUid(uid:string):Promise<Error | null> {
    if (uid === this.uid_) {
      return null;
    }

    this.uid_ = uid;
    let err = await this.table_.set(Me.uidStr, this.uid_);
    if (err != null) {
      return err;
    }

    await this.getPlugin().nc().post(new LibraryShouldReInitByUidChanged());

    return null;
  }

  public async uid():Promise<string> {
    if (this.uid_ === null) {
      let [ret, err] = await this.table_.get(Me.uidStr);
      if (err !== null) {
        ret = Me.empty;
      }
      this.uid_ = ret;
    }

    return this.uid_;
  }

  async init():Promise<void> {
    this.table_ = new Table(this.getDBM().getShareDBAtSessionStorage(), "Me");
  }

  needClearWhenUidChanged(): boolean {
    return false;
  }
}
