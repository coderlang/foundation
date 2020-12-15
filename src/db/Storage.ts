

export interface Storage {
  set(key:string, value:string):Promise<Error|null>;
  get(key:string):Promise<[string, Error|null]>;
  remove(key:string):Promise<Error|null>;
}