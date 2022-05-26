import { client as WebSocketClient, connection as Connection } from "websocket";
import { assertDefined } from "./utils";

interface Config {
  /** channel the bot will use to communicate */
  channel: string;
  /** name of the bot - must match account used to generate access token */
  name: string;
}

export class BotClient {
  private name: string;
  private channel: string;
  private client: WebSocketClient;
  private connection: Connection | undefined;

  constructor(config: Config) {
    this.name = config.name;
    this.channel = config.channel;
    this.client = new WebSocketClient();
  }

  /** Function that inintialises connection */
  async connect(): Promise<void> {
    this.client.connect("ws://irc-ws.chat.twitch.tv:80");

    const connect = () =>
      new Promise<Connection>((resolve) =>
        this.client.on("connect", (connection) => {
          resolve(connection);
        })
      );

    this.connection = await connect();
  }

  /** authenticate with server & join channel */
  login(token: string): void {
    assertDefined(this.connection, "connection not initialised");
    this.connection.sendUTF(`PASS oauth:${token}`);
    this.connection.sendUTF(`NICK ${this.name}`);
    this.connection.sendUTF(`JOIN ${this.channel}`);
  }

  /** send a message in the channel */
  sendMesage(message: string): void {
    assertDefined(this.connection);
    this.connection.sendUTF(`PRIVMSG #${this.channel} :${message}`);
  }

  /** Helper function for capturing all messages send by the server */
  captureLogs(): void {
    assertDefined(this.connection, "connection not initialised");

    this.connection.on("message", (message) => {
      const text =
        message.type === "utf8"
          ? message.utf8Data
          : message.binaryData.toString();
      console.log("Received: '" + text + "'");
    });
  }
}
