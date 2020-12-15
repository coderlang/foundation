import {DB} from "./DB";
import {Plugin} from "../Plugin";
import {LibraryShouldReInitByUidChanged, Me} from "../model/Me";
import {Storage} from "./Storage";
import {NullDB} from "./NullDB";

export abstract class DBManager {
  public getShareDBAtSessionStorage():DB {
    if (this.shareAtSession_ === null) {
      this.shareAtSession_ = new DB(this.newSessionStorage()
        , this.getDBName(DBManager.shareName));
    }
    return this.shareAtSession_;
  }

  public getShareDBAtLocalStorage():DB {
    if (this.shareAtLocal_ === null) {
      this.shareAtLocal_ = new DB(this.newLocalStorage()
        , this.getDBName(DBManager.shareName));
    }
    return this.shareAtLocal_;
  }

  public async getSelfDB():Promise<DB> {
    if (this.selfDB_ === null) {
      await this.createSelfDB();
    }

    return this.selfDB_!;
  }

  public getPlugin():Plugin {
    return this.plugin_;
  }

  private async createSelfDB():Promise<void> {
    let me = await (await this.plugin_.mf().getModel(Me)).uid();
    if (!Me.isValidUid(me)) {
      this.selfDB_ = new NullDB(this.newSessionStorage());
    } else {
      this.selfDB_ = new DB(this.newSessionStorage(), this.getDBName(me));
    }
  }

  private getDBName(name:string):string {
    return this.plugin_.getName() + "." + name;
  }

  /**
   *
   * @param plugin
   *
   * 初始化时，不要初始化SelfDB, 因为 self 依赖me, 而按照整个框架，me 依赖于shareDB ,
   * 此时，任何DB都还不能确定创建好，也不能确定初始化的顺序，所以不能在这里初始化selfDB
   */
  public constructor(plugin:Plugin) {
    this.plugin_ = plugin;

    // Me.uid 改变时，应该重新创建selfDB
    plugin.nc().register(this, LibraryShouldReInitByUidChanged
      , async (event):Promise<void> => {
        await this.createSelfDB();
      })
  }

  protected abstract newSessionStorage():Storage

  protected abstract newLocalStorage():Storage

  private shareAtLocal_:DB|null = null;
  private shareAtSession_:DB|null = null;
  private selfDB_:DB|null = null;

  static readonly shareName = "share";
  private readonly plugin_:Plugin;
}
