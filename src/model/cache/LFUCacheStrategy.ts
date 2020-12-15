
import {CacheStrategy} from "./CacheStrategy";

export class LFUCacheStrategy<T> extends CacheStrategy<T> {

  constructor(maxCnt:number = 1000, changeCnt:number = maxCnt/10) {
    super(maxCnt, changeCnt)
  }

  adjustCache(newData: T[]): T[] {
    // 每访问一次id  对应的times加1
    for (let id of newData) {
      let times:number = this.ids_.get(id) || 0;
      ++times;
      this.ids_.set(id, times);
    }

    return super.adjust()
  }

}


