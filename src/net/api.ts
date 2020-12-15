import {Net} from "./Net";
import {DefaultConstructor, Json, SignNonceStr} from "utils";
import {Token} from "../model/Token";

export enum Code {
  TokenExpireCode = 401,
  // NotModified = 304,
  ElseError = 500
}

const Success = 200

export class CodeError extends Error{
  constructor(err:string|Error, public code:Code = Code.ElseError) {
    super();
    this.name = "CodeError"
    if (typeof err === 'string') {
      this.message = `${err}, code:${code}`
    } else {
      this.message = `${err.message}, code:${code}`
      this.stack = err.stack
    }
  }
}

const ReqId = "X-Req-Id"
const TokenStr = "token"
const CodeStr = "code"

/*
 网络不能正常通信的情况：本地net为401 或者 token 为空，直接返回，不发起真正的网络请求
 token为空或者服务器告之网络不同的情况，net层需要process401。
 时序规定：
 api是401不一定net也是401，可能api返回时，其他地方已经处理完了401；
 net是401，不一定该api也是401，可能401发生在服务器返回此api之前；
 如果api是401，但net不是401，则一定是其他地方已经处理完了401，而不是没有处理401的情况，
    也就是本地第一个401的api，一定同时让net也处理401
*/
export async function PostJson<T extends object>(uri:string, request: object
  , resType:DefaultConstructor<T>, net:Net, headers:Map<string, string> = new Map<string, string>())
  :Promise<[T, CodeError|null]> {

  if (net.is401()) {
    return [new resType(), new CodeError("has 401", Code.TokenExpireCode)]
  }
  let token = await net.getToken()
  // token为空，需要处理401，并且不执行真正的网络请求。
  if (token === Token.empty) {
    net.process401()
    return [new resType(), new CodeError("token is empty", Code.TokenExpireCode)]
  }
  (<Record<string, any>>request)[TokenStr] = token

  let [ret, err] = await PostJsonNoToken(uri, request, resType, net, headers)
  if (!err || err.code !== Code.TokenExpireCode) {
    // 取消401
    net.clear401()
    return [ret, err]
  }

  // 返回401时，如果请求的token与现在存储token不是一样的，说明有登录接口修改过，最新
  // 存储的token是否过期，无法判断，所以不能执行真正的401操作
  // 此处不能通过net层is401来判断，还没有开始处理401或者其他接口处理完401的情况下，is401都是false
  // 但是后一种情况却不能执行401；对token而言后一种情况token一定不一样，却可以分辨出两种情况
  if (token !== await net.getToken()) {
    return [new resType(), new CodeError("token is too old", Code.TokenExpireCode)]
  }

  net.process401()
  return [new resType(), new CodeError("token is expire", Code.TokenExpireCode)]
}

export async function PostJsonNoToken<T extends object>(uri:string, request: object
  , resType:DefaultConstructor<T>, net:Net, headers:Map<string, string> = new Map<string, string>())
  : Promise<[T, CodeError|null]> {

  let reqid = SignNonceStr()
  headers.set(ReqId, reqid)
  console.log(`uri:${uri} reqid:${reqid} to ${net.getBaseUrl()}`);

  let req = new Json().toJson(request)

  console.log(`uri:${uri} reqid:${reqid} request`, req);

  let [res, err] = await net.getHttpBuilder().setUri(uri).setHeaders(headers)
    .setContent(req).build().send()
  if (err) {
    return [new resType(), new CodeError(err)]
  }
  if (res === "") {
    return [new resType(), new CodeError("response is empty")]
  }

  console.log(`uri:${uri} reqid:${reqid} response`, res);

  let resO = JSON.parse(res) as Record<string, any>
  let code = resO[CodeStr]

  if (code !== Success) {
    return [new resType(), new CodeError("code is not success", code)]
  }

  let [resT, err1] = new Json().fromJson(resO, resType)
  if (err1) {
    return [new resType(), new CodeError(err1)]
  }

  return [resT, null]
}
