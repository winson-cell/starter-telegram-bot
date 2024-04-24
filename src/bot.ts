import { Bot, InlineKeyboard, webhookCallback } from "grammy";
import express from "express";
const { MongoClient } = require('mongodb');


// Create a bot using the Telegram token
const bot = new Bot(process.env.TELEGRAM_TOKEN || "");
const addresses_boss = ["rMkHVoVFk3vLGJgJCUjcGnjiq2jRsk4vsx", "rHLLfANXaJgM44zZTSHBpjK3nfj8v1zqg", "rJw2tbTmYaGTpQFHYNY2ZVQVkiJ6m6hgPd", "rh61B9Fc9B1fGLhux4DFDejrXh9vYjxqrw", "rEF4TADNwLy4wg73mc72Fu9w8j8NwKG1xD", "rDjCaAWNJNSzBAqVU3xmuLTUmA6uQBzDhU","rnmFKEUUSV7f3tesgKE3ETWMs83Bm9Vw9K","rG9jC9zH4gaSYAxtstEiMmc6UKEKGAyfM","rhp2TbZzHUK2TvFh2D5GhqJLM9S6NSHzsJ","rsQKVUDihMp2HHV9ZeRh1rTMd8jNwPKjEm","rfGPGXDi4KqwiDNUwqieK3pZH9DNeD21zG","rNRMPZkawUTCBjhVcDwftGGMp2f67GjaZF","rJUncLkASRPU11KarYxWn43vJWVv1MBC7a","rGLDRDBVDEUbQYrZGosDShfmcjs2hChd8j","rf9Jzd3zHs6sKr7gQSsHiro7PfmwRnrz94","rHPStZVvY8vfHnmSAz42YS2nCokFT6Lx64","rKs52FV88bi4aPKTNCE8J8mkfCEKA1FjNC","rMPXb5ACRmZjHxsyJoSRSDtwqk794gZ5i7","rxNGVH7UmFaDny9JAi2V5NAPJNrkDRMFA","rEkX9U8hsmNh49bps5LS29PuuC9J3Tu1TV","rscubpHLuqhKSyPJW1en8L6wU3uV4hY6PV","rJrXD3SvMR4tSrjk7w1C5HirEcdsjUUrbp","rBwFA5hFFDcKntehMxu4PzT48zvjwMqQos","rf1oYmmAYNv6L1T6hP32SNg9y7Dvdj7rsn","rnC9wViUaGxuSimhjgs3muHGihdjazwsh3","rfDC19ArUcmJko1bQBxfKkZ6ft53yqw6yk"]
const evernode = require("evernode-js-client");
const mongo_uri = "mongodb://mongo:fm8Ty9C2dGL16hz543lEauKU7iODA0YW@hnd1.clusters.zeabur.com:30451";
const client = new MongoClient(mongo_uri);

const schedule = require("node-schedule");
let job:any;

// let date_time = new Date();

// // get current date
// // adjust 0 before single digit date
// let date = ("0" + date_time.getDate()).slice(-2);

// // get current month
// let month = ("0" + (date_time.getMonth() + 1)).slice(-2);

// // get current year
// let year = date_time.getFullYear();

// // get current hours
// let hours = date_time.getHours();

// // get current minutes
// let minutes = date_time.getMinutes();

// // get current seconds
// let seconds = date_time.getSeconds();

// // prints date & time in YYYY-MM-DD HH:MM:SS format
// console.log(year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds);
// job = schedule.scheduleJob('1 */1 * * *', () => {

// bot.command("start1", async (ctx) => {
//     let new_msg = false
//     let message_id:any = 0
//     job = schedule.scheduleJob('*/5 * * * * *', () => {

//       if (new_msg == false){
//         new_msg = true
//         ctx.reply('hello').then(result => message_id = result.message_id);
//       }
//       else{
//         console.log(message_id)
//         console.log(message_id[0])
//         console.log(message_id.message_id)
  
//         console.log("hello")
//         ctx.api.editMessageText(
//           ctx.chat.id,
//           message_id,
//           "Done! \n nice",
//         );
//         // ctx.editMessageText()
//       }
      
//     });
// });

bot.command("stop_job", async (ctx) => {
  if (job) {
        job.cancel()
        console.log("cancelled job")
    }
});


// Handle the /yo command to greet the user
bot.command("yo", (ctx) => ctx.reply(`Yo ${ctx.from?.username}`));

bot.command("check_status_boss_job", async (ctx) => {

  const message = await ctx.reply("Running Job Every Hour");
  const message_ID = message.message_id
  // const message = await ctx.reply("Connecting to Server");
  // const message_ID = message.message_id
  // console.log(message.message_id)
  // '*/5 * * * * *'
  // 1 */1 * * *
  job = schedule.scheduleJob('1 */1 * * *', () => {
    // console.log("0hi")
    main(ctx, addresses_boss,message_ID)
  })
});

bot.command("check_status_boss", async (ctx) => {
  await ctx.reply("Connecting to Server");
  // main(ctx, addresses_boss)
});

bot.command("add_account", async (ctx :any) => {
  await ctx.reply("adding account");
  // splitting into an array
  let accounts = ctx.message['text'].split(" ")
  accounts = accounts[1].split(",")
  for(let i=0; i<=accounts.length - 1; i++) {
    accounts[i] = accounts[i].split(' ').join('')
  }

  try {
      // Connect to the MongoDB cluster
      await client.connect();

      // Make the appropriate DB calls
      // await listDatabases(client);
      const db = client.db("Evernode");

      await db.collection('Account').insertOne({
        username: ctx.message["chat"]["username"],
        accounts: accounts,
      });

  } catch (e) {
        console.error(e);
  } finally {
      // Close the connection to the MongoDB cluster
      await client.close();
      await ctx.reply("done adding account");
  }

});

bot.command("check_account", async (ctx :any) => {
  try {
    // Connect to the MongoDB cluster
    await client.connect();
    const db = client.db("Evernode");
    const accounts = db.collection("accounts");
    console.log(ctx.message["chat"]["username"])
    const query = { username: "Winson2000" };
    const result = await accounts.findOne(query)
    console.log(result)
    } catch (e) {
          console.error(e);
    } finally {
        // Close the connection to the MongoDB cluster
        await client.close();
        await ctx.reply("Found account");
    }
})

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
  // main(ctx, message_address)
});


// async function main(ctx:any) {
//   console.log(chatId)
//   await ctx.reply("partY");
// }
async function main(ctx:any, addresses:any, message_ID:any) {

  let date_time = new Date();
  // get current date
  // adjust 0 before single digit date
  let date = ("0" + date_time.getDate()).slice(-2);
  // get current month
  let month = ("0" + (date_time.getMonth() + 1)).slice(-2);
  // get current year
  let year = date_time.getFullYear();
  // get current hours
  let hours = date_time.getHours();
  // get current minutes
  let minutes = date_time.getMinutes();
  // get current seconds
  let seconds = date_time.getSeconds();

  // prints date & time in YYYY-MM-DD HH:MM:SS format
  let time_now = year + "-" + month + "-" + date + " " + hours + ":" + minutes + ":" + seconds;

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
    // console.log("connected")
    // await ctx.reply("Connected checking host");
    var total = 0
    var i = 0
    for (const address of addresses) {
      await governorClient.getHostInfo(address).then((result:any) => {
        // console.log("calculating")
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
    ctx.api.editMessageText(
        ctx.chat.id,
        message_ID,
        "active host : " + active.toString() + "\nTime now: " + time_now,
    );
    if (not_active > 0){
      await ctx.reply("not active host : " + not_active.toString())
      await ctx.reply("not active address : " + not_active_address.toString())
    }
    // await ctx.reply("active host : " + active.toString())

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

// bot.command("start", replyWithIntro);
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
