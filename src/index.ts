// import { client as WebSocketClient } from "websocket";
import { config } from "dotenv";
import express from "express";
import { BotClient } from "./client";
import { buildAuthorizeURI, fetchToken } from "./auth";

const app = express();
app.use(express.json());

app.get("/", async (req, res) => {
  if (req.query.code) {
    res.sendStatus(200);

    const token = await fetchToken(req.query.code as string);

    const bot = new BotClient({
      token,
      name: "skink-b0t",
      channel: "skinkyyy",
    });

    await bot.connect();
    bot.captureLogs();
    bot.login(token);
  } else {
    res.sendStatus(401);
  }
});

app.post("/hooks", (req, res) => {
  console.log(req.query);
});

app.get("/auth", (req, res) => {
  res.set("Content-Type", "text/html");

  res.send(
    Buffer.from(`<a href="${buildAuthorizeURI()}">
  Connect with Twitch
</a>`)
  );
});

app.listen(3000, () => {
  console.log("app listening on port 3000 🚀");
});

config();
