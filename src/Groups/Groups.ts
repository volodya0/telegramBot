import { Day, GetCurrentDay } from "../Common";

export enum Status {
    Green,
    White,
    Red,
}

export interface Period {
    startTime: number;
    endTime: number;
    periodNumber: number;
    day: Day;
}

export interface StatusForPeriod {
    period: Period;
    status: Status;
}

export interface CityGroupsScheduleBase {
    PeriodsCount: number;
    GetStatus(day: Day, group: number, period: number): Status;
}

export class GroupsSchedule {
    private readonly cityGroupsSchedule: CityGroupsScheduleBase;

    constructor(cityGroupsSchedule: CityGroupsScheduleBase) {
        this.cityGroupsSchedule = cityGroupsSchedule;
    }

    public GetCurrentPeriod(): number {
        const hours = new Date(Date.now()).getHours();
        const result = Math.floor(((hours - 1 + 24) % 24) / 4);

        return result;
    }

    public GetGroupStatus(group: number, day: Day, period: number) {
        const result = this.cityGroupsSchedule.GetStatus(day, group, period);

        return result;
    }

    public GetGroupStatusForPeriod(group: number, period: Period) {
        const status = this.cityGroupsSchedule.GetStatus(
            period.day,
            group,
            period.periodNumber
        );

        return { status, period };
    }

    public GetCurrentGroupStatus(group: number): StatusForPeriod {
        const currentDay = GetCurrentDay();
        const currentPeriod = this.GetCurrentPeriod();
        const status = this.GetGroupStatus(group, currentDay, currentPeriod);
        const period = this.GetPeriod(currentPeriod, currentDay);

        return { status, period: period };
    }

    public GetFutureGroupStatuses(group: number, count: number) {
        const result: StatusForPeriod[] = [];

        let period = this.GetPeriod(this.GetCurrentPeriod(), GetCurrentDay());

        for (let i = 0; i < count; i++) {
            const statusForPeriod = this.GetGroupStatusForPeriod(group, period);
            result.push(statusForPeriod);
            period = this.GetNearPeriod(period, 1);
        }

        return result;
    }

    public GetPeriod(periodNumber: number, day: Day): Period {
        const start = (periodNumber * 4 + 1) % 24;
        const end = (start + 4) % 24;

        return {
            startTime: start,
            endTime: end,
            day,
            periodNumber: periodNumber,
        };
    }

    public GetNearPeriod(period: Period, periodsOffset: number = 1) {
        const targetPeriodNumber = period.periodNumber + periodsOffset;

        const periodNumber = ((targetPeriodNumber % 6) + 6) % 6;

        const dayOffset =
            targetPeriodNumber > 0
                ? Math.floor(targetPeriodNumber / 6)
                : Math.floor(targetPeriodNumber / 6);

        const day = (period.day + dayOffset + 7) % 7;

        const result = this.GetPeriod(periodNumber, day);
        return result;
    }

    public GetCurrentGroupsStatus(): StatusForPeriod[] {
        const result = [
            this.GetCurrentGroupStatus(0),
            this.GetCurrentGroupStatus(1),
            this.GetCurrentGroupStatus(2),
        ];

        return result;
    }
}
