import {Net} from "./Net";
import {PostJson} from "./api";
import {AppInvalidEvent, Me} from "../model/Me";

class Request {}
class Response {}
export async function PostJsonLogout(uri:string, net:Net
  , headers:Map<string, string> = new Map<string, string>()): Promise<void> {

  await PostJson(uri, new Request(), Response, net, headers)

  // 如下的设置需要先清除token，再失效Me，最后再postEvent
  // 主网络才需要操作Me及发App事件
  await net.clearToken();
  if (net.isMainNet()) {
    await (await net.getPlugin().mf().getModel(Me)).InValidate();
    await net.getPlugin().nc().post(new AppInvalidEvent());
  }
}