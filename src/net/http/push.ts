import {Net} from "../Net";
import {DefaultConstructor, Json} from "utils";

class Command {
  cmd:string|null = null
  data:string|null = null
}

export function RegisterStreamPush<T extends object>(net:Net, cmd:string
                                               , handler: (data:T)=>void, typ:DefaultConstructor<T>) {

  console.info(`RegisterStreamPush ${cmd}` + " for " + net.getBaseUrl())
  let cmds = allPushHandlers.get(net.getBaseUrl())
  if (!cmds) {
    cmds = new Map<string, (data:string)=>void>()
    allPushHandlers.set(net.getBaseUrl(), cmds)
  }
  cmds.set(cmd, data => {
    let [res, err] = new Json().fromJson(data, typ)
    if (err) {
      console.error(err)
      return
    }
    handler(res)
  })
}

export function UnRegisterStreamPush(net:Net, cmd:string) {
  console.info(`UnRegisterStreamPush ${cmd}` + " for " + net.getBaseUrl())
  let cmds = allPushHandlers.get(net.getBaseUrl())
  if (!cmds) {
    return
  }

  cmds.delete(cmd)
}

export function handlerOfPush(baseUrl: string): (data: string)=>void{
  return data => {
    let cmds = allPushHandlers.get(baseUrl)
    if (!cmds) {
      console.warn("not register push handler for " + baseUrl)
      return
    }

    let [cmd, err] = new Json().fromJson(data, Command)
    if (err) {
      console.error(err)
      return;
    }
    if (cmd.cmd === null) {
      console.warn("'cmd' in push data is error for " + baseUrl)
      return
    }
    let handler = cmds.get(cmd.cmd)
    if (!handler) {
      console.warn(`not register push handler for ${cmd.cmd} of ${baseUrl}`)
      return
    }

    if (cmd.data === null) {
      console.warn(`'data' in push data is null for ${cmd.cmd} of ${baseUrl}`)
      return
    }

    handler(cmd.data)
  }
}

type NetUrl = string;
type Cmd = string;

let allPushHandlers = new Map<NetUrl, Map<Cmd, (data:string)=>void>>()

