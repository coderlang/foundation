import {HttpBuilder} from "./HttpBuilder";
import {Http} from "./Http";
import {Stream} from "./Stream";


export function StreamBuilderCreator(headerAPIKey:string = "api"): (baseUrl:string)=>HttpBuilder {
  return baseUrl => {
    let builder = new class extends HttpBuilder {
      build(): Http {
        return new Stream(this, headerAPIKey)
      }
    }

    return builder.setBaseUrl(baseUrl)
  }
}
