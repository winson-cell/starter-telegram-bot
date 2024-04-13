import { Bot, InlineKeyboard, webhookCallback } from "grammy";
import { add, chunk } from "lodash";
import express from "express";
import { applyTextEffect, Variant } from "./textEffects";

import type { Variant as TextEffectVariant } from "./textEffects";

// Create a bot using the Telegram token
const bot = new Bot(process.env.TELEGRAM_TOKEN || "");
const addresses_boss = ["rMkHVoVFk3vLGJgJCUjcGnjiq2jRsk4vsx", "rHLLfANXaJgM44zZTSHBpjK3nfj8v1zqg", "rJw2tbTmYaGTpQFHYNY2ZVQVkiJ6m6hgPd", "rh61B9Fc9B1fGLhux4DFDejrXh9vYjxqrw", "rEF4TADNwLy4wg73mc72Fu9w8j8NwKG1xD", "rDjCaAWNJNSzBAqVU3xmuLTUmA6uQBzDhU","rnmFKEUUSV7f3tesgKE3ETWMs83Bm9Vw9K","rG9jC9zH4gaSYAxtstEiMmc6UKEKGAyfM","rhp2TbZzHUK2TvFh2D5GhqJLM9S6NSHzsJ","rsQKVUDihMp2HHV9ZeRh1rTMd8jNwPKjEm","rfGPGXDi4KqwiDNUwqieK3pZH9DNeD21zG","rNRMPZkawUTCBjhVcDwftGGMp2f67GjaZF","rJUncLkASRPU11KarYxWn43vJWVv1MBC7a","rGLDRDBVDEUbQYrZGosDShfmcjs2hChd8j","rf9Jzd3zHs6sKr7gQSsHiro7PfmwRnrz94","rHPStZVvY8vfHnmSAz42YS2nCokFT6Lx64","rKs52FV88bi4aPKTNCE8J8mkfCEKA1FjNC","rMPXb5ACRmZjHxsyJoSRSDtwqk794gZ5i7","rxNGVH7UmFaDny9JAi2V5NAPJNrkDRMFA","rEkX9U8hsmNh49bps5LS29PuuC9J3Tu1TV","rscubpHLuqhKSyPJW1en8L6wU3uV4hY6PV","rJrXD3SvMR4tSrjk7w1C5HirEcdsjUUrbp","rBwFA5hFFDcKntehMxu4PzT48zvjwMqQos","rf1oYmmAYNv6L1T6hP32SNg9y7Dvdj7rsn","rnC9wViUaGxuSimhjgs3muHGihdjazwsh3","rfDC19ArUcmJko1bQBxfKkZ6ft53yqw6yk"]
const evernode = require("evernode-js-client");

// Handle the /yo command to greet the user
bot.command("yo", (ctx) => ctx.reply(`Yo ${ctx.from?.username}`));

bot.command("check_status_boss", async (ctx) => {
  await ctx.reply("Connecting to Server");
  main(ctx, addresses_boss)
});

bot.command("check_address", async (ctx :any) => {
  // console.log(ctx.message)
  // console.log(ctx.message['text'])
  let message_address = ctx.message['text'].split("\n")
  // let addresses = []
  message_address.splice(0, 1);
  for(let i=0; i<=message_address.length - 1; i++) {
    // console.log(i)
    // console.log(message_address[i])
    message_address[i] = message_address[i].split(' ').join('')
  }
  // console.log(message_address)
  await ctx.reply("Connecting to Server");
  main(ctx, message_address)
  // await ctx.reply(`${ctx.message}`);
  // main(ctx)
});


// async function main(ctx:any) {
//   console.log(chatId)
//   await ctx.reply("partY");
// }
async function main(ctx:any, addresses:any) {
  let active = 0
  let not_active = 0
  let not_active_address:any[] = []
  try {
    // Use a singleton xrplApi for all tests.
    await evernode.Defaults.useNetwork('mainnet');
    const xrplApi = new evernode.XrplApi(null, { autoReconnect: false });
    evernode.Defaults.set({
      xrplApi: xrplApi,
      useCentralizedRegistry: true // Conent to use centralized registry functions.
    });
    await xrplApi.connect();
    const governorClient = await evernode.HookClientFactory.create(evernode.HookTypes.governor);
    await governorClient.connect();
    await ctx.reply("Connected checking host");
    var total = 0
    var i = 0
    for (const address of addresses) {
      await governorClient.getHostInfo(address).then((result:any) => {
        i = i + 1
        if (result["active"] == false){
          not_active_address.push(address)
          not_active = not_active + 1
        }
        else{
          active = active + 1
        }
      })
        .catch((error:any) => {
          console.error(error); // This will be called if the promise is rejected
        });
    }
    } catch (e) {
      console.log(e)
      await ctx.reply("error when connecting to the address")
    }
    await ctx.reply("active host : " + active.toString())
    await ctx.reply("not active host : " + not_active.toString())
    await ctx.reply("not active address : " + not_active_address.toString())
  }


// Suggest commands in the menu
bot.api.setMyCommands([
  { command: "yo", description: "Be greeted by the bot" },
  {
    command: "check_address",
    description: "Check Status of evernode host",
  },
]);

// Handle all other messages and the /start command
const introductionMessage = `Hello! I'm a Telegram bot.
I'm powered by Cyclic, the next-generation serverless computing platform.

<b>Commands</b>
/check_address - check address of host
/effect [text] - Show a keyboard to apply text effects to [text]`;

const replyWithIntro = (ctx: any) =>
  ctx.reply(introductionMessage, {
    parse_mode: "HTML",
  });

bot.command("start", replyWithIntro);
bot.on("message", replyWithIntro);

// Start the server
if (process.env.NODE_ENV === "production") {
  // Use Webhooks for the production server
  const app = express();
  app.use(express.json());
  app.use(webhookCallback(bot, "express"));

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Bot listening on port ${PORT}`);
  });
} else {
  // Use Long Polling for development
  bot.start();
}
