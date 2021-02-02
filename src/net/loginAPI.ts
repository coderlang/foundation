import {DefaultConstructor} from "utils";
import {Net} from "./Net";
import {CodeError, PostJsonNoToken} from "./api";
import {AppInvalidEvent, AppReValidEvent, Me} from "../model/Me";

export async function PostJsonLoginWithRes<T extends object>(uri:string, request: object
  , resType:DefaultConstructor<T>, net:Net, headers:Map<string, string> = new Map<string, string>())
  : Promise<[T, CodeError|null]>{

  let meModel = await net.getPlugin().mf().getModel(Me);
  // 如下的设置需要先清除token，再失效Me，最后再postEvent
  // 主网络才需要操作Me及发App事件
  await net.clearToken();
  if (net.isMainNet()) {
    await meModel.InValidate();
    await net.getPlugin().nc().post(new AppInvalidEvent());
  }

  let ret = new resType();
  class UidTokenMix {
    public uid = "";
    public token = "";
    constructor() {
      for (let key in ret) {
        (<any>this)[key] = (<any>ret)[key]
      }
    }
  }

  let [mix, err] = await PostJsonNoToken(uri, request, UidTokenMix, net, headers)
  if (err) {
    return [ret, err];
  }

  // 如下的设置需要先使Me有效后(初始化库)，再设置token，最后再postEvent
  // 主网络才需要操作Me及发App事件
  net.isMainNet()?(await meModel.ReValidateWithUid(mix.uid)):null;
  await net.setToken(mix.token);
  net.isMainNet()?(await net.getPlugin().nc().post(new AppReValidEvent())):null;

  for (let key in ret) {
    (<any>ret)[key] = (<any>mix)[key];
  }

  return [ret, null];
}

class Response {}
export async function PostJsonLogin(uri:string, request: object, net:Net): Promise<CodeError|null> {
  let [, err] = await PostJsonLoginWithRes(uri, request, Response, net)
  return err
}
