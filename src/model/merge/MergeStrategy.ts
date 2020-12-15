

export interface MergeStrategy {
  // 如果old != null, old可能会被修改为合并后的值，但返回值一定是合并后的值；如果old == null, 则只有返回值才是合并后的值
  mergeToOld<T extends Record<string, any>>(old: T|null, new_: T): [T, boolean];
  mergeToOldArray(old: string[], new_: string[]): boolean;
}
