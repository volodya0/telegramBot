import { Markup, Scenes } from "telegraf";
import {
    Day,
    DigitsToIconsString,
    FillCharacters,
    GetCurrentDay,
    ScenesEnum,
} from "../Common";
import {
    GroupsSchedule,
    Period,
    Status,
    StatusForPeriod,
} from "../Groups/Groups";
import { LvivGroups } from "../Groups/LvivGroups/LvivGroups";
import { MyContext as CtxBase } from "../App";

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
}

class Services {
    private groupsSchedule = new GroupsSchedule(new LvivGroups());
    private groupsCount: number = 3;

    public GetGroupLabel(group: number, prefix?: boolean) {
        return prefix
            ? "group " + DigitsToIconsString(group + 1)
            : DigitsToIconsString(group + 1);
    }

    public GetNextPeriod(period: Period) {
        return this.groupsSchedule.GetNearPeriod(period, 1);
    }

    public GetPrevPeriod(period: Period) {
        return this.groupsSchedule.GetNearPeriod(period, -1);
    }

    public GetCurrentPeriod() {
        const currentDay = GetCurrentDay();
        const currentPeriod = this.groupsSchedule.GetCurrentPeriod();
        const periodInfo = this.groupsSchedule.GetPeriod(
            currentPeriod,
            currentDay
        );

        return periodInfo;
    }

    public GetStateForPeriod(period: Period): StatusForPeriod[] {
        const result = [];

        for (let i = 0; i < this.groupsCount; i++) {
            result.push(this.groupsSchedule.GetGroupStatusForPeriod(i, period));
        }

        return result;
    }

    public GetFormattedStateForPeriod(period: Period) {
        const statusForPeriods = this.GetStateForPeriod(period);
        const currentPeriod = this.GetCurrentPeriod();

        let result = "";
        if (
            currentPeriod.day === period.day &&
            currentPeriod.periodNumber === period.periodNumber
        ) {
            result +=
                "Current state (" +
                this.getFormattedPeriodInfo(period) +
                ") :\n\n";
        } else {
            result +=
                "State for " + this.getFormattedPeriodInfo(period) + " :\n\n";
        }

        statusForPeriods.forEach((statusForPeriod, i) => {
            result +=
                this.GetGroupLabel(i, true) +
                " -> " +
                this.getStatusDescription(statusForPeriod.status) +
                "\n";
        });

        return result;
    }

    public GetDetailedInfo(group: number) {
        let result = "";

        this.groupsSchedule
            .GetFutureGroupStatuses(group, 10)
            .forEach((statusForPeriod, i) => {
                result += `${this.getFormattedStatusForPeriod(
                    statusForPeriod
                )}`;

                if (!i) {
                    result += " (now)";
                }

                result += "\n";
            });

        return result;
    }

    private getFormattedStatusForPeriod({ status, period }: StatusForPeriod) {
        return `${this.getFormattedPeriodInfo(
            period
        )} -> ${this.getStatusDescription(status)}`;
    }

    private getFormattedPeriodInfo(
        { startTime: start, endTime: end, day }: Period // alignDayName: boolean = false
    ) {
        return `${Day[day]}, ${FillCharacters(
            start.toString(),
            2,
            "0"
        )}:00 - ${FillCharacters(end.toString(), 2, "0")}:00`;
    }

    private getStatusDescription(status: Status) {
        let emoji;
        switch (status) {
            case Status.Red:
                emoji = "🟥";
                break;
            case Status.Green:
                emoji = "🟩";
                break;
            case Status.White:
                emoji = "⬜️";
                break;
            default:
                break;
        }

        return `${emoji} ${Status[status]}`;
    }
}
const services = new Services();

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
        `${services.GetFormattedStateForPeriod(
            ctx.c.state.selectedPeriod
        )}\n\n`,
        keyboard
    );
}

function replyDetailedInfo(ctx: Ctx) {
    const group = (((ctx.c.state.selectedGroup ?? 0) % 3) + 3) % 3;

    ctx.reply(
        `Detailed state for ${services.GetGroupLabel(
            group,
            true
        )}:\n\n${services.GetDetailedInfo(group)}`,
        groupsKeyboard
    );
}

LightScheduleScene.enter((ctx) => {
    ctx.c.state.selectedPeriod = services.GetCurrentPeriod();
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
    ctx.c.state.selectedPeriod = services.GetCurrentPeriod();
    replySelectedPeriodInfo(ctx);
    ctx.answerCbQuery();
});

LightScheduleScene.action(Action[Action.CurrentState], (ctx) => {
    ctx.c.state.selectedPeriod = services.GetCurrentPeriod();

    replySelectedPeriodInfo(ctx);
    ctx.answerCbQuery();
});

LightScheduleScene.action(Action[Action.NextPeriod], (ctx) => {
    ctx.c.state.selectedPeriod = services.GetNextPeriod(
        ctx.c.state.selectedPeriod
    );

    replySelectedPeriodInfo(ctx);
    ctx.answerCbQuery();
});

LightScheduleScene.action(Action[Action.PrevPeriod], (ctx) => {
    ctx.c.state.selectedPeriod = services.GetPrevPeriod(
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
]);

const groupsKeyboard = Markup.inlineKeyboard([
    /*     [
        Markup.button.callback("<- Prev Period", Action[Action.PrevPeriod]),
        Markup.button.callback("Next period ->", Action[Action.NextPeriod]),
    ],
 */
    [
        Markup.button.callback(
            services.GetGroupLabel(0),
            Action[Action.DetailedStateFirst]
        ),

        Markup.button.callback(
            services.GetGroupLabel(1),
            Action[Action.DetailedStateSecond]
        ),

        Markup.button.callback(
            services.GetGroupLabel(2),
            Action[Action.DetailedStateThird]
        ),
    ],

    [Markup.button.callback("Periods view", Action[Action.ToPeriodsView])],
]);
