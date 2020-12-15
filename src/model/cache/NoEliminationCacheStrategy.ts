
import {CacheStrategy} from "./CacheStrategy";

export class NoEliminationCacheStrategy<T> extends CacheStrategy<T> {
  constructor() {
    super(0, 0);
  }

  clear(): void {}

  adjustCache(newData: T[]): T[] {
    return [];
  }
}




