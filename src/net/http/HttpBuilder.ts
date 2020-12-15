


import {Http} from "./Http";
import {Net} from "../Net";

export abstract class HttpBuilder {
  public abstract build():Http;

  protected baseUrl_ = "";
  protected uri_ = "";
  protected headers_: Map<string, string> = new Map();
  protected content_:string = "";

  public setContent(content:string): this {
    this.content_ = content;
    return this;
  }

  public content():string {
    return this.content_;
  }

  public setBaseUrl(url:string): this {
    this.baseUrl_ = url;
    return this;
  }

  public baseUrl():string {
    return this.baseUrl_;
  }

  public setUri(uri:string): this {
    this.uri_ = uri;
    return this;
  }

  public uri():string {
    return this.uri_;
  }

  public setHeaders(headers: Map<string, string>): this {
    this.headers_ = headers;
    return this;
  }

  public addHeader(key:string, val: string): this {
    this.headers_.set(key, val);
    return this;
  }

  public headers():Map<string, string> {
    return this.headers_
  }
}

