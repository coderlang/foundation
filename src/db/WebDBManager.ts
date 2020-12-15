import {DBManager} from "./DBManager";
import {Storage} from "./Storage";


class WebLocalStorage implements Storage{
  async get(key: string): Promise<[string, Error | null]> {
    let [ret, err] = localStorage.getItem(key);
    if (typeof ret == "number" || typeof ret == "boolean" || (typeof ret == "object" && ret instanceof Date)) {
      ret = ret.toString()
      console.warn("getStorage ret type error")
    }

    return [ret, err]
  }

  async remove(key: string): Promise<Error | null> {
    return Promise.resolve(null);
  }

  async set(key: string, value: string): Promise<Error | null> {
    return Promise.resolve(null);
  }
}

export class WXDBManager extends DBManager {
  protected newSessionStorage():Storage {
    return new WebLocalStorage();
  }

  protected newLocalStorage():Storage {
    return new WebLocalStorage();
  }
}