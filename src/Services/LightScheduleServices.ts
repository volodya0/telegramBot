import {
    DigitsToIconsString,
    GetCurrentDay,
    Day,
    FillCharacters,
} from "../Common";
import {
    GroupsSchedule,
    Period,
    LightStateForPeriod,
    LightState,
} from "../Groups/Groups";
import { LvivGroups } from "../Groups/LvivGroups/LvivGroups";

export enum TimeVariant {
    TV0 = 1,
    TV5 = 5,
    TV10 = 10,
    TV15 = 15,
    TV20 = 20,
    TV30 = 30,
    TV60 = 60,
}

export enum GroupVariant {
    ALL,
    F,
    S,
    T,
    FS,
    FT,
    ST,
}

export interface LightScheduleSubscription {
    id: string;
    chatId: number;
    timeVariant: TimeVariant;
    groupVariant: GroupVariant;
}

class LightScheduleSceneServices {
    private groupsSchedule = new GroupsSchedule(new LvivGroups());
    private groupsCount: number = 3;

    public TimeVariants = [
        "TV0",
        "TV5",
        "TV10",
        "TV15",
        "TV20",
        "TV30",
        "TV60",
    ];

    public GroupsVariant = ["ALL", "F", "S", "T", "FS", "FT", "ST"];

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

    public GetAllGroupsStateForPeriod(period: Period): LightStateForPeriod[] {
        const result = [];

        for (let i = 0; i < this.groupsCount; i++) {
            result.push(this.GetGroupStateForPeriod(i, period));
        }

        return result;
    }

    public GetGroupStateForPeriod(
        group: number,
        period: Period
    ): LightStateForPeriod {
        return this.groupsSchedule.GetGroupStatusForPeriod(group, period);
    }

    public GetFormattedStateForPeriod(period: Period) {
        const statusForPeriods = this.GetAllGroupsStateForPeriod(period);
        const currentPeriod = this.GetCurrentPeriod();

        let result = "";
        if (
            currentPeriod.day === period.day &&
            currentPeriod.periodNumber === period.periodNumber
        ) {
            result +=
                "Current state (" + this.getFormattedPeriod(period) + ") :\n\n";
        } else {
            result += "State for " + this.getFormattedPeriod(period) + " :\n\n";
        }

        statusForPeriods.forEach((statusForPeriod, i) => {
            result +=
                this.GetGroupLabel(i, true) +
                " -> " +
                this.getStateDescription(statusForPeriod.lightState, true) +
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

    private getFormattedStatusForPeriod({
        lightState: status,
        period,
    }: LightStateForPeriod) {
        return `${this.getFormattedPeriod(
            period
        )} -> ${this.getStateDescription(status, true)}`;
    }

    private getFormattedPeriod(
        { startTime: start, endTime: end, day }: Period // alignDayName: boolean = false
    ) {
        return `${Day[day]}, ${FillCharacters(
            start.toString(),
            2,
            "0"
        )}:00 - ${FillCharacters(end.toString(), 2, "0")}:00`;
    }

    private getStateDescription(status: LightState, reverse = false) {
        let icon;
        switch (status) {
            case LightState.Red:
                icon = "🟥";
                break;
            case LightState.Green:
                icon = "🟩";
                break;
            case LightState.White:
                icon = "⬜️";
                break;
            default:
                break;
        }

        if (reverse) {
            return `${icon} ${LightState[status]}`;
        } else {
            return `${LightState[status]} ${icon}`;
        }
    }

    public GetGroupsFromGroupVariant(groupVariant: GroupVariant) {
        switch (groupVariant) {
            case GroupVariant.ALL:
                return [0, 1, 2];
            case GroupVariant.FS:
                return [0, 1];
            case GroupVariant.FT:
                return [0, 2];
            case GroupVariant.ST:
                return [1, 2];
            case GroupVariant.F:
                return [0];
            case GroupVariant.S:
                return [1];
            case GroupVariant.T:
                return [2];
        }
    }

    public GetSubscriptionCronTime(subscription: LightScheduleSubscription) {
        const minutes = (60 - subscription.timeVariant).toString();
        const hours = "0/6";

        return "0 " + minutes + " " + hours + " * * *";
    }

    public GetSubscriptionUpdateContent(
        subscription: LightScheduleSubscription
    ) {
        let result = "";

        if (subscription.timeVariant === TimeVariant.TV0) {
            result = "The state is changed now:";
        } else {
            result =
                "The state will be changed in " +
                subscription.timeVariant +
                " minutes:";
        }

        result += "\n\n";

        const groups = this.GetGroupsFromGroupVariant(
            subscription.groupVariant
        );

        const currentPeriod = this.GetCurrentPeriod();
        groups.forEach((group) => {
            const currentState = this.GetGroupStateForPeriod(
                group,
                currentPeriod
            );
            const nextState = this.GetGroupStateForPeriod(
                group,
                this.GetNextPeriod(currentPeriod)
            );

            result +=
                this.GetGroupLabel(group, true) +
                ": " +
                this.getStateDescription(currentState.lightState) +
                " -> " +
                this.getStateDescription(nextState.lightState, true);
        });

        return result;
    }

    public FormatSubscription(subscription: LightScheduleSubscription) {
        let result = "";

        result +=
            "Time: " +
            subscription.timeVariant +
            " minutes before state change\n";
        result +=
            "Groups to show: " +
            this.GetGroupsFromGroupVariant(subscription.groupVariant).map((g) =>
                this.GetGroupLabel(g)
            ) +
            "\n";

        return result;
    }
}

export const lightScheduleServices = new LightScheduleSceneServices();
