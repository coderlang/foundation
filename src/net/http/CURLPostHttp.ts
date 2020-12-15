import {Http} from "./Http";
import {HttpBuilder} from "./HttpBuilder";
import axios from "axios";

export class CURLPostHttp implements Http {
  send(): Promise<[string, (Error | null)]> {
    return new Promise<[string, (Error|null)]>((resolve, reject) => {
      axios({
        method: 'post',
        url: this.builder.baseUrl() + this.builder.uri(),
        headers: this.builder.headers(),
        data: this.builder.content(),
      }).then((res:{data:string}) => {
        resolve([res.data, null]);
      }).catch(() => {
        resolve(["", new Error("net error")]);
      })
    })
  }

  constructor(private builder: HttpBuilder, private headerAPIKey: string = "api") {}
}