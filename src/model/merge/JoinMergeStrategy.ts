

import {MergeStrategy} from "./MergeStrategy";
import {equals} from "utils";

export class JoinMergeStrategy implements MergeStrategy {

  mergeToOld<T extends Record<string, any>>(old: T|null, new_: T): [T, boolean] {
    if (old === null) {
      return [new_, true]
    }

    let _old: any = <any>old;
    let _new_: any = <any>new_;

    let eq: boolean = true;

    for (let key in _new_) {
      if (_old.hasOwnProperty(key) && _new_.hasOwnProperty(key)
        && _new_[key] !== null) {
        eq = eq && equals(_old[key], _new_[key]);
        _old[key] = _new_[key];
      }
    }

    return [old, !eq];
  }

  mergeToOldArray(old: string[], new_: string[]): boolean {
    if (new_.length == 0) {
      return false;
    }

    old.push(...new_);
    return true;
  }
}