import { Markup, Scenes } from "telegraf";
import { ScenesEnum } from "../Common";
import { Period } from "../Groups/Groups";
import { CtxBase } from "../App";
import { lightScheduleServices } from "../Services/LightScheduleServices";

enum Action {
    CurrentState,
    DetailedStateFirst,
    DetailedStateSecond,
    DetailedStateThird,
    NextPeriod,
    PrevPeriod,
    Back,
    ToDetailedView,
    ToPeriodsView,
    ToSettings,
}

type Ctx = CtxBase<{
    selectedPeriod: Period;
    selectedGroup?: number;
    isDetailedView: boolean;
}>;

export const LightScheduleScene = new Scenes.BaseScene<Ctx>(
    ScenesEnum.LightScheduleScene
);

function replySelectedPeriodInfo(ctx: Ctx) {
    ctx.reply(
        `${lightScheduleServices.GetFormattedStateForPeriod(
            ctx.c.state.selectedPeriod
        )}\n\n`,
        keyboard
    );
}

function replyDetailedInfo(ctx: Ctx) {
    const group = (((ctx.c.state.selectedGroup ?? 0) % 3) + 3) % 3;

    ctx.reply(
        `Detailed state for ${lightScheduleServices.GetGroupLabel(
            group,
            true
        )}:\n\n${lightScheduleServices.GetDetailedInfo(group)}`,
        groupsKeyboard
    );
}

LightScheduleScene.enter((ctx) => {
    ctx.c.state.selectedPeriod = lightScheduleServices.GetCurrentPeriod();
    ctx.c.state.isDetailedView = false;

    replySelectedPeriodInfo(ctx);
});

LightScheduleScene.action(Action[Action.Back], (ctx) => {
    ctx.scene.enter(ScenesEnum.LightScheduleScene);
    ctx.answerCbQuery();
});

LightScheduleScene.action(Action[Action.ToDetailedView], (ctx) => {
    ctx.c.state.isDetailedView = true;
    ctx.reply(`Select group`, groupsKeyboard);
    ctx.answerCbQuery();
});

LightScheduleScene.action(Action[Action.ToPeriodsView], (ctx) => {
    ctx.c.state.isDetailedView = false;
    ctx.c.state.selectedPeriod = lightScheduleServices.GetCurrentPeriod();
    replySelectedPeriodInfo(ctx);
    ctx.answerCbQuery();
});

LightScheduleScene.action(Action[Action.ToSettings], (ctx) => {
    ctx.scene.enter(ScenesEnum.LightScheduleSettingsScene);
});

LightScheduleScene.action(Action[Action.CurrentState], (ctx) => {
    ctx.c.state.selectedPeriod = lightScheduleServices.GetCurrentPeriod();

    replySelectedPeriodInfo(ctx);
    ctx.answerCbQuery();
});

LightScheduleScene.action(Action[Action.NextPeriod], (ctx) => {
    ctx.c.state.selectedPeriod = lightScheduleServices.GetNextPeriod(
        ctx.c.state.selectedPeriod
    );

    replySelectedPeriodInfo(ctx);
    ctx.answerCbQuery();
});

LightScheduleScene.action(Action[Action.PrevPeriod], (ctx) => {
    ctx.c.state.selectedPeriod = lightScheduleServices.GetPrevPeriod(
        ctx.c.state.selectedPeriod
    );

    replySelectedPeriodInfo(ctx);
    ctx.answerCbQuery();
});

LightScheduleScene.action(Action[Action.DetailedStateFirst], (ctx) => {
    ctx.c.state.selectedGroup = 0;
    replyDetailedInfo(ctx);
    ctx.answerCbQuery();
});

LightScheduleScene.action(Action[Action.DetailedStateSecond], (ctx) => {
    ctx.c.state.selectedGroup = 1;
    replyDetailedInfo(ctx);
    ctx.answerCbQuery();
});

LightScheduleScene.action(Action[Action.DetailedStateThird], (ctx) => {
    ctx.c.state.selectedGroup = 2;
    replyDetailedInfo(ctx);
    ctx.answerCbQuery();
});

const keyboard = Markup.inlineKeyboard([
    [
        Markup.button.callback("<- Prev Period", Action[Action.PrevPeriod]),
        Markup.button.callback("Next period ->", Action[Action.NextPeriod]),
    ],
    [Markup.button.callback("Current period", Action[Action.CurrentState])],
    [Markup.button.callback("Detailed view", Action[Action.ToDetailedView])],
    [Markup.button.callback("Settings", Action[Action.ToSettings])],
]);

const groupsKeyboard = Markup.inlineKeyboard([
    [
        Markup.button.callback(
            lightScheduleServices.GetGroupLabel(0),
            Action[Action.DetailedStateFirst]
        ),

        Markup.button.callback(
            lightScheduleServices.GetGroupLabel(1),
            Action[Action.DetailedStateSecond]
        ),

        Markup.button.callback(
            lightScheduleServices.GetGroupLabel(2),
            Action[Action.DetailedStateThird]
        ),
    ],

    [Markup.button.callback("Periods view", Action[Action.ToPeriodsView])],
    [Markup.button.callback("Settings", Action[Action.ToSettings])],
]);
