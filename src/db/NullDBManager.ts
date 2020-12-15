import {DBManager} from "./DBManager";
import {Storage} from "./Storage";

export class NullStorage implements Storage {
  async get(key: string): Promise<[string, (Error | null)]> {
    return Promise.resolve(["", null]);
  }

  async remove(key: string): Promise<Error | null> {
    return Promise.resolve(null);
  }

  async set(key: string, value: string): Promise<Error | null> {
    return Promise.resolve(null);
  }
}

export class NullDBManager extends DBManager{
  protected newLocalStorage(): Storage {
    return new NullStorage();
  }

  protected newSessionStorage(): Storage {
    return new NullStorage();
  }
}