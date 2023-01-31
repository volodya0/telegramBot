import { Scenes, Markup } from "telegraf";
import { ScenesEnum } from "../Common";
import { CtxBase } from "../App";
import {
    TimeVariant,
    GroupVariant,
    lightScheduleServices,
    LightScheduleSubscription as LightScheduleSubscription,
} from "../Services/LightScheduleServices";
import { Setting } from "../Data";

enum Action {
    Subscribe,
    Unsubscribe,
    Cancel,
    MySubscription,
    RemoveSubscription,
    BackToSchedule,
}

type Ctx = CtxBase<{
    isTimeSelecting?: boolean;
    selectedTimeVariant?: TimeVariant;
    isGroupsContentSelecting?: boolean;
    selectedGroupVariant?: GroupVariant;
}>;

export const LightScheduleSceneSettings = new Scenes.BaseScene<Ctx>(
    ScenesEnum.LightScheduleSettingsScene
);

function clearState(ctx: Ctx) {
    ctx.c.state.isGroupsContentSelecting = false;
    ctx.c.state.isTimeSelecting = false;
    ctx.c.state.selectedTimeVariant = undefined;
    ctx.c.state.selectedGroupVariant = undefined;
}

LightScheduleSceneSettings.enter((ctx) => {
    const subscription = ctx.c.GetSetting(Setting.lightScheduleSubscription);

    ctx.reply(`Chose what do you want to setup`, keyboard(!!subscription));
});

LightScheduleSceneSettings.action(Action[Action.BackToSchedule], (ctx) => {
    ctx.scene.enter(ScenesEnum.LightScheduleScene);
});

LightScheduleSceneSettings.action(Action[Action.Subscribe], (ctx) => {
    ctx.c.state.isTimeSelecting = true;

    ctx.reply(
        `Select the time before or type custom amount in minutes`,
        timeSelectKeyboard
    );
});

LightScheduleSceneSettings.action(Action[Action.Cancel], (ctx) => {
    clearState(ctx);

    ctx.scene.reenter();
});

LightScheduleSceneSettings.action(lightScheduleServices.TimeVariants, (ctx) => {
    const variant = (ctx.update.callback_query as any).data;

    if (!ctx.c.state.isTimeSelecting || TimeVariant[variant] === undefined) {
        return ctx.scene.reenter();
    }

    ctx.c.state.selectedTimeVariant = +TimeVariant[variant];
    ctx.c.state.isTimeSelecting = false;
    ctx.c.state.isGroupsContentSelecting = true;
    ctx.reply(
        "Ok, which do you want to see in notification",
        groupContentKeyboard
    );

    return;
});

LightScheduleSceneSettings.action(
    lightScheduleServices.GroupsVariant,
    (ctx) => {
        const variant = (ctx.update.callback_query as any).data;

        if (
            !ctx.c.state.isGroupsContentSelecting ||
            GroupVariant[variant] === undefined ||
            !ctx.chat
        ) {
            return ctx.scene.reenter();
        }

        ctx.c.state.selectedGroupVariant = +GroupVariant[variant];
        ctx.c.state.isGroupsContentSelecting = false;

        const subscriptionId = Date.now().toString();

        const subscription: LightScheduleSubscription = {
            id: subscriptionId,
            chatId: ctx.chat.id,
            groupVariant: ctx.c.state.selectedGroupVariant!,
            timeVariant: ctx.c.state.selectedTimeVariant!,
        };

        ctx.c.SetSetting(Setting.lightScheduleSubscription, subscription);
        ctx.c.InitSubscriptions();

        clearState(ctx);

        ctx.c.ctx.reply("Ok, your subscription added", keyboard(true));

        return;
    }
);

LightScheduleSceneSettings.action(Action[Action.MySubscription], (ctx) => {
    const subscription = ctx.c.GetSetting(Setting.lightScheduleSubscription);

    if (!subscription) {
        return;
    }

    ctx.reply(
        `You current subscription:\n\n${lightScheduleServices.FormatSubscription(
            subscription
        )}`,
        subscriptionOptionsKeyboard
    );
});

LightScheduleSceneSettings.action(Action[Action.RemoveSubscription], (ctx) => {
    ctx.c.SetSetting(Setting.lightScheduleSubscription, undefined);
    ctx.c.InitSubscriptions();

    ctx.reply(`Your subscription has been removed`, keyboard(false));
});

const cancelButton = Markup.button.callback("Cancel", Action[Action.Cancel]);

const keyboard = (haSubscription?: boolean) =>
    Markup.inlineKeyboard([
        [
            haSubscription
                ? Markup.button.callback(
                      "My subscription",
                      Action[Action.MySubscription]
                  )
                : Markup.button.callback(
                      "Subscribe to updates",
                      Action[Action.Subscribe]
                  ),
        ],
        [
            Markup.button.callback(
                "Back to schedule",
                Action[Action.BackToSchedule]
            ),
        ],
    ]);

const timeSelectKeyboard = Markup.inlineKeyboard([
    [Markup.button.callback("At the moment", TimeVariant[TimeVariant.TV0])],
    [
        Markup.button.callback("5", TimeVariant[TimeVariant.TV5]),
        Markup.button.callback("10", TimeVariant[TimeVariant.TV10]),
    ],
    [
        Markup.button.callback("15", TimeVariant[TimeVariant.TV15]),
        Markup.button.callback("20", TimeVariant[TimeVariant.TV20]),
    ],
    [
        Markup.button.callback("30", TimeVariant[TimeVariant.TV30]),
        Markup.button.callback("60", TimeVariant[TimeVariant.TV60]),
    ],
    [cancelButton],
]);

const groupContentKeyboard = Markup.inlineKeyboard([
    [Markup.button.callback("All groups", GroupVariant[GroupVariant.ALL])],
    [
        Markup.button.callback("1", GroupVariant[GroupVariant.F]),
        Markup.button.callback("2", GroupVariant[GroupVariant.S]),
        Markup.button.callback("3", GroupVariant[GroupVariant.T]),
    ],
    [
        Markup.button.callback("1 and 2", GroupVariant[GroupVariant.FS]),
        Markup.button.callback("1 and 3", GroupVariant[GroupVariant.FT]),
        Markup.button.callback("2 and 3", GroupVariant[GroupVariant.ST]),
    ],
    [cancelButton],
]);

const subscriptionOptionsKeyboard = Markup.inlineKeyboard([
    [
        Markup.button.callback(
            "Remove subscription",
            Action[Action.RemoveSubscription]
        ),
    ],
    [cancelButton],
]);
