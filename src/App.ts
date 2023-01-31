import { Scenes, session, Telegraf, Telegram } from "telegraf";
import { ScenesEnum } from "./Common";
import { LightScheduleScene } from "./Scenes/LigthSchedule";
import { Data, Setting } from "./Data";
import { isProduction, ProdBotToken, TestBotToken } from "./Config";
import { LightScheduleSceneSettings } from "./Scenes/LightScheduleSettings";
import {
    lightScheduleServices,
    LightScheduleSubscription,
} from "./Services/LightScheduleServices";
import { CronJob } from "cron";

export type CtxBase<S extends Record<string, any> = {}> =
    Scenes.SceneContext & {
        c: C<S>;
    };

const bot = new Telegraf<CtxBase>(isProduction ? ProdBotToken : TestBotToken, {
    telegram: { webhookReply: true },
});
const telegram = new Telegram(isProduction ? ProdBotToken : TestBotToken);
const jobs: CronJob[] = [];
const data = new Data();

class C<S extends Record<string, any> = {}> {
    public ctx: Scenes.SceneContext = {} as any;

    get userId() {
        return (this.ctx as any).from?.id as number;
    }

    get message() {
        return (this.ctx.message as any)?.text as string;
    }

    get state(): S {
        const id = this.userId;
        const db = data as Data;
        return db.GetState(id);
    }

    public UpdateStatistic() {
        data.UpdateStatistic();
    }

    public AddUserUpdate() {
        const u = this.ctx.update as any;
        const from = u.message?.from ?? u.callback_query?.from;

        if (!from) {
            return;
        }

        const update = {
            type: u.updateType,
            username: from.username,
            first_name: from.first_name,
            message_text: u.message?.text,
            callbac_data: u.callback_query?.data,
        };

        data.AddUserUpdate(this.userId, JSON.stringify(update));
    }

    public GetSetting(setting: Setting) {
        return data.GetSetting(this.userId, setting);
    }

    public SetSetting(setting: Setting, value: any) {
        data.SetSetting(this.userId, setting, value);
    }

    public InitSubscriptions() {
        for (let i = 0; i < jobs.length; i++) {
            jobs[i].stop();
        }

        const lightScheduleSubscriptions: LightScheduleSubscription[] = [];

        const allSettings = Object.values(data.GetAllSettings());

        for (let i = 0; i < allSettings.length; i++) {
            const settings = allSettings[i] ?? {};
            const subscription = settings[Setting.lightScheduleSubscription];
            if (
                subscription &&
                subscription.chatId &&
                subscription.groupVariant &&
                subscription.timeVariant
            ) {
                lightScheduleSubscriptions.push(subscription);
            }
        }

        for (let i = 0; i < lightScheduleSubscriptions.length; i++) {
            const subscription = lightScheduleSubscriptions[i];

            const job = new CronJob(
                /* "0/10 * * * * *" ?? */
                lightScheduleServices.GetSubscriptionCronTime(subscription),
                () => {
                    telegram.sendMessage(
                        subscription.chatId,
                        lightScheduleServices.GetSubscriptionUpdateContent(
                            subscription
                        )
                    );
                }
            );
            job.start();
            jobs.push(job);
        }
    }
}

const stage = new Scenes.Stage<Scenes.SceneContext>([
    /*  MainScene, */
    LightScheduleScene as any,
    LightScheduleSceneSettings as any,
]);

const c = new C();
bot.context.c = new C();
let isInitialized = false;

(async () => {
    await data.asyncInit();

    c.InitSubscriptions();

    if (!isProduction) {
        bot.launch();
    }

    isInitialized = true;
})();

bot.use((ctx, next) => {
    if (!isInitialized) {
        return;
    }

    ctx.c.ctx = ctx;

    ctx.c.UpdateStatistic();
    ctx.c.AddUserUpdate();

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

bot.on("callback_query", (ctx) => {
    ctx.scene.enter(ScenesEnum.LightScheduleScene);
});

bot.catch((err, ctx) => {
    ctx.scene.enter(ScenesEnum.LightScheduleScene);
});

// Enable graceful stop
process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));

export default bot;
