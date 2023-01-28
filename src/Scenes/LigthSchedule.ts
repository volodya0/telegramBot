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
    PeriodInfo,
    Status,
    StatusForPeriod,
} from "../Groups/Groups";
import { LvivGroups } from "../Groups/LvivGroups/LvivGroups";

class LightScheduleSceneServices {
    private groupsSchedule = new GroupsSchedule(new LvivGroups());

    public GroupLabels = [
        "group " + DigitsToIconsString(1),
        "group " + DigitsToIconsString(2),
        "group " + DigitsToIconsString(3),
    ];

    public GetCurrentState() {
        const currentDay = GetCurrentDay();
        const currentPeriod = this.groupsSchedule.GetCurrentPeriod();

        let result = `Current state (${this.getFormattedPeriodInfo(
            this.groupsSchedule.GetPeriodInfo(currentPeriod, currentDay)
        )}):\n\n`;

        this.groupsSchedule
            .GetCurrentGroupsStatus()
            .forEach(({ status }, i) => {
                result += `${this.GroupLabels[i]} - ${this.getStatusDescription(
                    status
                )}\n`;
            });

        return result;
    }

    public GetDetailedInfo(group: number) {
        let result = "";

        this.groupsSchedule
            .GetFutureGroupStatuses(group, 8)
            .forEach((statusForPeriod, i) => {
                result += `${this.getFormattedPeriodStatus(statusForPeriod)}`;

                if (!i) {
                    result += " (now)";
                }

                result += "\n";
            });

        return result;
    }

    private getFormattedPeriodStatus({ status, periodInfo }: StatusForPeriod) {
        return `${this.getFormattedPeriodInfo(
            periodInfo
        )} -> ${this.getStatusDescription(status)}`;
    }

    private getFormattedPeriodInfo(
        { start, end, day }: PeriodInfo // alignDayName: boolean = false
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
const services = new LightScheduleSceneServices();

export const LightScheduleScene = new Scenes.BaseScene<Scenes.SceneContext>(
    ScenesEnum.LightScheduleScene
);

LightScheduleScene.enter((ctx) => {
    ctx.reply(
        `${services.GetCurrentState()}\nChose group to see detailed info`,
        keyboard
    );
});

LightScheduleScene.hears("Back to main", (ctx) => {
    ctx.scene.enter(ScenesEnum.MainScene);
});

/* LightScheduleScene.hears("Settings", (ctx) => {
    ctx.scene.enter(ScenesEnum.LightScheduleSettingsScene);
}); */

LightScheduleScene.hears("Current state", (ctx) => {
    ctx.reply(
        `${services.GetCurrentState()}\nChose group to see detailed info`,
        keyboard
    );
});

LightScheduleScene.hears(services.GroupLabels[0], (ctx) => {
    ctx.reply(
        `Detailed state for ${
            services.GroupLabels[0]
        }:\n\n${services.GetDetailedInfo(0)}`,
        keyboard
    );
});

LightScheduleScene.hears(services.GroupLabels[1], (ctx) => {
    ctx.reply(
        `Detailed state for ${
            services.GroupLabels[1]
        }:\n\n${services.GetDetailedInfo(1)}`,
        keyboard
    );
});

LightScheduleScene.hears(services.GroupLabels[2], (ctx) => {
    ctx.reply(
        `Detailed state for ${
            services.GroupLabels[2]
        }:\n\n${services.GetDetailedInfo(2)}`,
        keyboard
    );
});

const keyboard = Markup.keyboard([
    [
        Markup.button.callback(services.GroupLabels[0], "0"),
        Markup.button.callback(services.GroupLabels[1], "1"),
        Markup.button.callback(services.GroupLabels[2], "2"),
    ],
    [Markup.button.callback("Current state", "Current state")],
    /*   [Markup.button.callback("Settings", "Settings")], */
]);
