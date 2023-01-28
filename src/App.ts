import { Scenes, session, Telegraf } from "telegraf";
import { ScenesEnum } from "./Common";
import { LightScheduleScene } from "./Scenes/LigthSchedule";
import { Data, Setting } from "./Data";
import { LightScheduleSceneSettings } from "./Scenes/LightScheduleSettings";
import { BotToken } from "./Config";

export type IContext = Scenes.SceneContext & {
    c: C;
};

if (typeof BotToken !== "string") {
    throw new Error("");
}

const data = new Data();
(async () => data.asyncInit())();

class C {
    public ctx: Scenes.SceneContext = {} as any;

    private data = data;

    get userId() {
        return this.ctx.message?.from.id as number;
    }

    get message() {
        return (this.ctx.message as any)?.text as string;
    }

    get state() {
        const id = this.userId;
        const db = this.data as Data;
        return db.GetState(id);
    }

    public UpdateStatistic() {
        this.data.UpdateStatistic();
    }

    public SubscribeToScheduleUpdates(timeVariant: string) {
        this.data.SetSettings(
            this.userId,
            Setting.lightScheduleSubscribeTimeVariant,
            timeVariant
        );
    }
}

const bot: Telegraf<IContext> = new Telegraf(BotToken);
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

bot.launch();

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
