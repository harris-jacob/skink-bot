import { config } from "dotenv";
import express from "express";
import { buildAuthorizeURI, fetchToken } from "./auth";
import { BotClient } from "./client";
import { handlePushEvent, PushPayload } from "./webhooks/push";

const app = express();
app.use(express.json());
const bot = new BotClient({
      name: "skink-b0t",
      channel: "skinkyyy",
    });

// Handle token redirect and bot connection
app.get("/", async (req, res) => {
  if (req.query.code) {
    res.sendStatus(200);

    const token = await fetchToken(req.query.code as string);
    await bot.connect();
    bot.captureLogs();
    bot.login(token);
  } else {
    res.sendStatus(401);
  }
});

// Handle github webhooks
app.post("/hooks", (req, res) => {
  handlePushEvent(req.body as PushPayload, bot.sendMesage.bind(bot));
  res.sendStatus(200);
});

// Connect with twitch and start auth workflow
app.get("/auth", (_, res) => {
  res.set("Content-Type", "text/html");

  res.send(
    Buffer.from(`<a href="${buildAuthorizeURI()}">
  Connect with Twitch
</a>`)
  );
});

config();

app.listen(3000, () => {
  console.log("app listening on port 3000 🚀");
});

