import {HttpBuilder} from "./HttpBuilder";
import {Http} from "./Http";
import {CURLPostHttp} from "./CURLPostHttp";


export function CURLPostHttpBuilderCreator(headerAPIKey:string = "api"): (baseUrl:string)=>HttpBuilder {
  return baseUrl => {
    let builder = new class extends HttpBuilder {
      build(): Http {
        return new CURLPostHttp(this, headerAPIKey)
      }
    }

    return builder.setBaseUrl(baseUrl)
  }
}
