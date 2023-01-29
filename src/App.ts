import { Scenes, session, Telegraf } from "telegraf";
import { ScenesEnum } from "./Common";
import { LightScheduleScene } from "./Scenes/LigthSchedule";
import { Data, Setting } from "./Data";
import { isProduction, ProdBotToken, TestBotToken } from "./Config";

export type IContext = Scenes.SceneContext & {
    c: C;
};

const data = new Data();
(async () => data.asyncInit())();

class C {
    public ctx: Scenes.SceneContext = {} as any;

    get userId() {
        return this.ctx.message?.from.id as number;
    }

    get message() {
        return (this.ctx.message as any)?.text as string;
    }

    get state() {
        const id = this.userId;
        const db = data as Data;
        return db.GetState(id);
    }

    public UpdateStatistic() {
        data.UpdateStatistic();
    }

    public SubscribeToScheduleUpdates(timeVariant: string) {
        data.SetSettings(
            this.userId,
            Setting.lightScheduleSubscribeTimeVariant,
            timeVariant
        );
    }
}

const bot = new Telegraf<IContext>(isProduction ? ProdBotToken : TestBotToken, {
    telegram: { webhookReply: true },
});
bot.context.c = new C();

const stage = new Scenes.Stage<Scenes.SceneContext>([
    /*  MainScene, */
    LightScheduleScene,
    // LightScheduleSceneSettings as any,
]);

bot.use((ctx, next) => {
    ctx.c.ctx = ctx;
    ctx.c.UpdateStatistic();
    next();
});
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

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

if (!isProduction) {
    bot.launch();
}

export default bot;
