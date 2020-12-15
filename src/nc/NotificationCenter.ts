

import {Event} from "./Event"
import {Plugin} from "../Plugin";
import {Class} from "utils";


export class NotificationCenter {
  private readonly plugin_: Plugin;
  private readonly eventId_ :symbol;
  private allEvent:Set<Class<Event> > = new Set();

  // 防止正在post时，事件响应中调用 unRegister 等方式造成map在循环中执行delete操作 产生不可预测的异常
  private postingMap: Map<object|symbol, (event: Event)=>Promise<void>> | null = null;
  private deleteObservers = new Set<object|symbol>()
  /**
   * @param plugin
   *
   */
  public constructor(plugin: Plugin) {
    this.plugin_ = plugin;
    this.eventId_ = Symbol("eventid");
  }

  public getPlugin():Plugin {
    return this.plugin_;
  }

  public async post(event: Event): Promise<void> {
    let map:Map<object|symbol, (event: Event)=>Promise<void>>
      = (<any>event)[this.eventId_] || new Map();

    this.postingMap = map;

    let exe = [];
    for( let [key, value] of map) {
      if (this.deleteObservers.has(key)) {
        continue;
      }
      exe.push(value(event));
    }
    // 并发执行
    await Promise.all(exe);

    // delete 需要删除的 observers
    for (let o of this.deleteObservers) {
      map.delete(o)
    }
    if (map.size == 0) {
      // todo event.constructor 是否等于 Class<T>.prototype
      this.allEvent.delete(event.constructor);
    }
    this.deleteObservers.clear();
    this.postingMap = null;
  }

  // 同一个observer多次注册同一个event，最后的执行函数以最后一次的为准
  public register<T extends Event>(observer: object|symbol
                                   , event: Class<T>, clbk: (t:T)=>Promise<void>): void {
    let map:Map<object|symbol, (event: T)=>Promise<void>>
      = (<any>event.prototype)[this.eventId_]
      = (<any>event.prototype)[this.eventId_] || new Map<object|symbol, (event: T)=>Promise<void>>();

    map.set(observer, clbk);
    this.allEvent.add(event);
  }

  public unRegister(observer: object|symbol, event: Class<Event>): void {
    let map:Map<object|symbol, (event: Event)=>Promise<void>> = (<any>event.prototype)[this.eventId_];
    
    if (!map) {
      return;
    }

    // 正在post
    if (map == this.postingMap) {
      this.deleteObservers.add(observer)
      return;
    }

    map.delete(observer);

    if (map.size == 0) {
      this.allEvent.delete(event);
    }
  }

  public unRegisterAll(observer: object|symbol): void {
    let del:Class<Event>[] = [];

    for (let event of this.allEvent) {
      let map:Map<object|symbol, (event: Event)=>Promise<void>> = (<any>event.prototype)[this.eventId_];
      if (!map) {
        return;
      }
      // 正在post
      if (map == this.postingMap) {
        this.deleteObservers.add(observer)
        return;
      }

      map.delete(observer);
      if (map.size == 0) {
        del.push(event);
      }
    }

    for (let event of del) {
      this.allEvent.delete(event);
    }
  }

}
