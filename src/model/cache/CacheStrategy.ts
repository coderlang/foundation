
export abstract class CacheStrategy<T> {
  protected constructor(private maxCnt:number, private changeCnt:number) {
  }

  public clear(): void {
    this.ids_.clear();
  }

  public abstract  adjustCache(newData: T[]): T[]

  protected adjust():T[] {
    if (this.ids_.size < this.maxCnt) {
      return [];
    }

    let array:[T, number][] = Array.from(this.ids_);
    array.sort((x, y)=>{
      return x[1]-y[1];
    });

    let ret:T[] = [];
    for (let i:number = 0; i < this.changeCnt; ++i) {
      ret.push(array[i][0]);
      this.ids_.delete(array[i][0]);
    }

    return ret;
  }

  protected ids_:Map<T, number> = new Map();
}

