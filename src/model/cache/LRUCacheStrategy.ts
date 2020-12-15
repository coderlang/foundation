
import {CacheStrategy} from "./CacheStrategy";

export class LRUCacheStrategy<T> extends CacheStrategy<T> {

  constructor(maxCnt:number = 1000, changeCnt:number = maxCnt/10) {
    super(maxCnt, changeCnt)
  }

  adjustCache(newData: T[]): T[] {
    // 最近访问的id 对应的time值越大

    for (let id of newData) {
      this.ids_.set(id, this.time++);
    }

    return this.adjust()
  }

  private time:number = 0;
}


