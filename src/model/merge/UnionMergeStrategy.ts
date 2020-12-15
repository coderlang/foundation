

import {JoinMergeStrategy} from "./JoinMergeStrategy";

export class UnionMergeStrategy extends JoinMergeStrategy {

  mergeToOldArray(old: string[], new_: string[]): boolean {
    let set: Set<string> = new Set();
    for (let value of old) {
      set.add(value)
    }

    let ret: boolean = false;

    for (let value of new_) {
      if (!set.has(value)) {
        set.add(value);
        old.push(value);
        ret = true;
      }
    }

    return ret;
  }
}
