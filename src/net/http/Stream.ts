import {Http} from "./Http";
import {HttpBuilder} from "./HttpBuilder";
import {Client} from "stream";
import {handlerOfPush} from "./push";

export class Stream implements Http{
  async send(): Promise<[string, (Error | null)]> {
    let client = Stream.allClients.get(this.builder.baseUrl())
    if (!client) {
      client = new Client(this.builder.baseUrl(), handlerOfPush(this.builder.baseUrl()))
      Stream.allClients.set(this.builder.baseUrl(), client)
    }

    this.builder.addHeader(this.headerAPIKey, this.builder.uri())
    return (await client.send(this.builder.content(), this.builder.headers()));
  }

  constructor(private builder: HttpBuilder, private headerAPIKey: string = "api") {}

  private static allClients = new Map<string, Client>()
}
