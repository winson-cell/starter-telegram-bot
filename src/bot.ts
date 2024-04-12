import { Bot, InlineKeyboard, webhookCallback } from "grammy";
import { add, chunk } from "lodash";
import express from "express";
import { applyTextEffect, Variant } from "./textEffects";

import type { Variant as TextEffectVariant } from "./textEffects";

// Create a bot using the Telegram token
const bot = new Bot(process.env.TELEGRAM_TOKEN || "");
const addresses = ["rMkHVoVFk3vLGJgJCUjcGnjiq2jRsk4vsx", "rHLLfANXaJgM44zZTSHBpjK3nfj8v1zqg", "rJw2tbTmYaGTpQFHYNY2ZVQVkiJ6m6hgPd", "rh61B9Fc9B1fGLhux4DFDejrXh9vYjxqrw", "rEF4TADNwLy4wg73mc72Fu9w8j8NwKG1xD", "rDjCaAWNJNSzBAqVU3xmuLTUmA6uQBzDhU","rnmFKEUUSV7f3tesgKE3ETWMs83Bm9Vw9K","rG9jC9zH4gaSYAxtstEiMmc6UKEKGAyfM","rhp2TbZzHUK2TvFh2D5GhqJLM9S6NSHzsJ","rsQKVUDihMp2HHV9ZeRh1rTMd8jNwPKjEm","rfGPGXDi4KqwiDNUwqieK3pZH9DNeD21zG","rNRMPZkawUTCBjhVcDwftGGMp2f67GjaZF","rJUncLkASRPU11KarYxWn43vJWVv1MBC7a","rGLDRDBVDEUbQYrZGosDShfmcjs2hChd8j","rf9Jzd3zHs6sKr7gQSsHiro7PfmwRnrz94","rHPStZVvY8vfHnmSAz42YS2nCokFT6Lx64","rKs52FV88bi4aPKTNCE8J8mkfCEKA1FjNC","rMPXb5ACRmZjHxsyJoSRSDtwqk794gZ5i7","rxNGVH7UmFaDny9JAi2V5NAPJNrkDRMFA","rEkX9U8hsmNh49bps5LS29PuuC9J3Tu1TV","rscubpHLuqhKSyPJW1en8L6wU3uV4hY6PV","rJrXD3SvMR4tSrjk7w1C5HirEcdsjUUrbp","rBwFA5hFFDcKntehMxu4PzT48zvjwMqQos","rf1oYmmAYNv6L1T6hP32SNg9y7Dvdj7rsn","rnC9wViUaGxuSimhjgs3muHGihdjazwsh3","rfDC19ArUcmJko1bQBxfKkZ6ft53yqw6yk"]
const evernode = require("evernode-js-client");

// Handle the /yo command to greet the user
bot.command("yo", (ctx) => ctx.reply(`Yo ${ctx.from?.username}`));

bot.command("check_status", async (ctx) => {
  await ctx.reply("Connecting to Server");
  main(ctx)
});

// async function main(ctx:any) {
//   console.log(chatId)
//   await ctx.reply("partY");
// }
async function main(ctx:any) {
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
        if (result["active"] == true){
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
    }
    await ctx.reply("active host : " + active.toString())
    await ctx.reply("not active host : " + not_active.toString())
    await ctx.reply("not active address : " + not_active_address.toString())
  }

// Handle the /effect command to apply text effects using an inline keyboard
type Effect = { code: TextEffectVariant; label: string };
const allEffects: Effect[] = [
  {
    code: "w",
    label: "Monospace",
  },
  {
    code: "b",
    label: "Bold",
  },
  {
    code: "i",
    label: "Italic",
  },
  {
    code: "d",
    label: "Doublestruck",
  },
  {
    code: "o",
    label: "Circled",
  },
  {
    code: "q",
    label: "Squared",
  },
];

const effectCallbackCodeAccessor = (effectCode: TextEffectVariant) =>
  `effect-${effectCode}`;

const effectsKeyboardAccessor = (effectCodes: string[]) => {
  const effectsAccessor = (effectCodes: string[]) =>
    effectCodes.map((code) =>
      allEffects.find((effect) => effect.code === code)
    );
  const effects = effectsAccessor(effectCodes);

  const keyboard = new InlineKeyboard();
  const chunkedEffects = chunk(effects, 3);
  for (const effectsChunk of chunkedEffects) {
    for (const effect of effectsChunk) {
      effect &&
        keyboard.text(effect.label, effectCallbackCodeAccessor(effect.code));
    }
    keyboard.row();
  }

  return keyboard;
};

const textEffectResponseAccessor = (
  originalText: string,
  modifiedText?: string
) =>
  `Original: ${originalText}` +
  (modifiedText ? `\nModified: ${modifiedText}` : "");

const parseTextEffectResponse = (
  response: string
): {
  originalText: string;
  modifiedText?: string;
} => {
  const originalText = (response.match(/Original: (.*)/) as any)[1];
  const modifiedTextMatch = response.match(/Modified: (.*)/);

  let modifiedText;
  if (modifiedTextMatch) modifiedText = modifiedTextMatch[1];

  if (!modifiedTextMatch) return { originalText };
  else return { originalText, modifiedText };
};

bot.command("effect", (ctx) =>
  ctx.reply(textEffectResponseAccessor(ctx.match), {
    reply_markup: effectsKeyboardAccessor(
      allEffects.map((effect) => effect.code)
    ),
  })
);

// Handle inline queries
const queryRegEx = /effect (monospace|bold|italic) (.*)/;
bot.inlineQuery(queryRegEx, async (ctx) => {
  const fullQuery = ctx.inlineQuery.query;
  const fullQueryMatch = fullQuery.match(queryRegEx);
  if (!fullQueryMatch) return;

  const effectLabel = fullQueryMatch[1];
  const originalText = fullQueryMatch[2];

  const effectCode = allEffects.find(
    (effect) => effect.label.toLowerCase() === effectLabel.toLowerCase()
  )?.code;
  const modifiedText = applyTextEffect(originalText, effectCode as Variant);

  await ctx.answerInlineQuery(
    [
      {
        type: "article",
        id: "text-effect",
        title: "Text Effects",
        input_message_content: {
          message_text: `Original: ${originalText}
Modified: ${modifiedText}`,
          parse_mode: "HTML",
        },
        reply_markup: new InlineKeyboard().switchInline("Share", fullQuery),
        url: "http://t.me/EludaDevSmarterBot",
        description: "Create stylish Unicode text, all within Telegram.",
      },
    ],
    { cache_time: 30 * 24 * 3600 } // one month in seconds
  );
});

// Return empty result list for other queries.
bot.on("inline_query", (ctx) => ctx.answerInlineQuery([]));

// Handle text effects from the effect keyboard
for (const effect of allEffects) {
  const allEffectCodes = allEffects.map((effect) => effect.code);

  bot.callbackQuery(effectCallbackCodeAccessor(effect.code), async (ctx) => {
    const { originalText } = parseTextEffectResponse(ctx.msg?.text || "");
    const modifiedText = applyTextEffect(originalText, effect.code);

    await ctx.editMessageText(
      textEffectResponseAccessor(originalText, modifiedText),
      {
        reply_markup: effectsKeyboardAccessor(
          allEffectCodes.filter((code) => code !== effect.code)
        ),
      }
    );
  });
}

// Handle the /about command
const aboutUrlKeyboard = new InlineKeyboard().url(
  "Host your own bot for free.",
  "https://cyclic.sh/"
);

// Suggest commands in the menu
bot.api.setMyCommands([
  { command: "yo", description: "Be greeted by the bot" },
  {
    command: "effect",
    description: "Apply text effects on the text. (usage: /effect [text])",
  },
]);

// Handle all other messages and the /start command
const introductionMessage = `Hello! I'm a Telegram bot.
I'm powered by Cyclic, the next-generation serverless computing platform.

<b>Commands</b>
/yo - Be greeted by me
/effect [text] - Show a keyboard to apply text effects to [text]`;

const replyWithIntro = (ctx: any) =>
  ctx.reply(introductionMessage, {
    reply_markup: aboutUrlKeyboard,
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
