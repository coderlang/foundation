import {DBManager} from "./DBManager";
import {Storage} from "./Storage";
import {awx} from "wxwrapper";


class WxStorage implements Storage{
  async get(key: string): Promise<[string, Error | null]> {
    let [ret, err] = await awx.getStorage(key)
    if (typeof ret == "number" || typeof ret == "boolean" || (typeof ret == "object" && ret instanceof Date)) {
      ret = ret.toString()
      console.warn("getStorage ret type error")
    }

    return [ret, err]
  }

  async remove(key: string): Promise<Error | null> {
    return (await awx.removeStorage(key))
  }

  async set(key: string, value: string): Promise<Error | null> {
    return (await awx.setStorage(key, value))
  }
}

export class WXDBManager extends DBManager {
  protected newSessionStorage():Storage {
    return new WxStorage();
  }

  protected newLocalStorage():Storage {
    return new WxStorage();
  }
}