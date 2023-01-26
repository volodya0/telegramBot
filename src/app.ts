import { Scenes, session, Telegraf, Telegram } from "telegraf";
import { MainScene } from "./Scenes/MainScene";
import { ScenesEnum } from "./Common";
import { LightScheduleScene } from "./Scenes/LigthSchedule";
import { BotToken } from "./Config";

// const telegram: Telegram = new Telegram(BotToken);
const bot: Telegraf<Scenes.SceneContext> = new Telegraf(BotToken);

const stage = new Scenes.Stage<Scenes.SceneContext>([
    /*  MainScene, */
    LightScheduleScene,
]);

bot.use(session());
bot.use(stage.middleware());

bot.start((ctx) => {
    ctx.scene.enter(ScenesEnum.LightScheduleScene);
});

bot.on("message", (ctx) => {
    ctx.scene.enter(ScenesEnum.LightScheduleScene);
});

bot.catch((err, ctx) => {
    ctx.scene.enter(ScenesEnum.LightScheduleScene);
});

bot.launch();

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
