import * as functions from "firebase-functions";
import { Telegraf } from "telegraf";

const bot = new Telegraf("5931318189:AAHEeh5HeOkiDk-EJ-SDUYeX31lrH_MhaoQ", {
    telegram: { webhookReply: true },
});

// error handling
bot.catch((err: any, ctx: any) => {
    functions.logger.error("[Bot] Error", err);
    return ctx.reply(`Ooops, encountered an error for ${ctx.updateType}`, err);
});

// initialize the commands
bot.command("/start", (ctx) =>
    ctx.reply("Hello! Send any message and I will copy it.")
);
// copy every message and send to the user
bot.on("message", (ctx) => ctx.telegram.sendCopy(ctx.chat.id, ctx.message));

// handle all telegram updates with HTTPs trigger
exports.echoBot = functions.https.onRequest(
    async (request: any, response: any) => {
        functions.logger.log("Incoming message", request.body);
        return await bot
            .handleUpdate(request.body, response)
            .then((rv: any) => {
                // if it's not a request from the telegram, rv will be undefined, but we should respond with 200
                return !rv && response.sendStatus(200);
            });
    }
);
