// import { client as WebSocketClient } from "websocket";
import { config } from "dotenv";
import fetch from "node-fetch";
import express from "express";
import { client as WebSocketClient } from "websocket";

// GLOBAL TOKEN STORE (DO NOT TRY THIS AT HOME!!)
let TOKEN: string | undefined;
const storeToken = (token: string) => {
  TOKEN = token;
};
const getToken = (): string => {
  if (TOKEN) {
    return TOKEN;
  }

  throw new Error("YOU DON'T HAVE A TOKEN");
};

const app = express();
app.use(express.json());

app.get("/", async (req, res) => {
  if (req.query.code) {
    res.sendStatus(200);
    const token = await fetchToken(req.query.code as string);
    storeToken(token);
    client.connect("ws://irc-ws.chat.twitch.tv:80");
  } else {
    res.sendStatus(401);
  }
});

app.get("/auth", (req, res) => {
  res.set("Content-Type", "text/html");
  const url =
    "https://id.twitch.tv/oauth2/authorize?" +
    new URLSearchParams({
      response_type: "code",
      client_id: process.env.CLIENT_ID || "",
      redirect_uri: "http://localhost:3000",
      scope: "chat:edit chat:read",
    });
  res.send(
    Buffer.from(`<a href="${url}">
  Connect with Twitch
</a>`)
  );
});

app.listen(3000, () => {
  console.log("app listening on port 3000 🚀");
});

config();

const client = new WebSocketClient();

client.on("connectFailed", (err) => {
  console.log("Connect error:" + err.toString());
});

client.on("connect", (connection) => {
  console.log("WebSocket client connected");

  connection.on("message", (message) => {
    const text =
      message.type === "utf8"
        ? message.utf8Data
        : message.binaryData.toString();
    console.log("Received: '" + text + "'");
  });

  // TODO I have no idea what this does yet
  connection.sendUTF("CAP REQ :twitch.tv/tags twitch.tv/commands");

  connection.sendUTF(`PASS oauth:${getToken()}`);
  connection.sendUTF("NICK skink-b0t");
  connection.sendUTF("JOIN skinkyyy");
  connection.sendUTF("PRIVMSG #skinkyyy :Hello Twitch! I am sentient now :)");
});

const validateToken = async (token: string) => {
  const response = await fetch("https://id.twitch.tv/oauth2/validate", {
    headers: { Authorization: `OAuth ${token}` },
  });

  const result = await response.json();

  console.log(result);
};

const fetchToken = async (code: string) => {
  console.log(code);
  const response = await fetch(
    "https://id.twitch.tv/oauth2/token?" +
      new URLSearchParams({
        code: code,
        client_id: process.env.CLIENT_ID || "",
        client_secret: process.env.CLIENT_SECRET || "",
        grant_type: "authorization_code",
        redirect_uri: "http://localhost:3000",
      }),
    { method: "POST" }
  );

  const result = await response.json();

  return result.access_token;
};
