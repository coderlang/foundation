

import {MergeStrategy} from "./MergeStrategy";
import {equals, nullize} from "utils";

export class OverWriteMergeStrategy implements MergeStrategy {

  mergeToOld<T extends Record<string, any>>(old: T|null, new_: T): [T, boolean] {
    if (old === null) {
      return [new_, true];
    }
    if (new_ === null) {
      return [old, false];
    }

    if (equals(old, new_)) {
      return [old, false];
    }

    return [new_, true];
  }

  mergeToOldArray(old: string[], new_: string[]): boolean {
    if (equals(old, new_)){
      return false;
    }

    old.splice(0, old.length);
    old.push(...new_);

    return true;
  }
}
