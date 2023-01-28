import { Day, GetCurrentDay } from "../Common";

export enum Status {
    Green,
    White,
    Red,
}

export interface PeriodInfo {
    start: number;
    end: number;
    day: Day;
}

export interface StatusForPeriod {
    periodInfo: PeriodInfo;
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

    public GetCurrentGroupStatus(group: number): StatusForPeriod {
        const currentDay = GetCurrentDay();
        const currentPeriod = this.GetCurrentPeriod();
        const status = this.GetGroupStatus(group, currentDay, currentPeriod);
        const period = this.GetPeriodInfo(currentPeriod, currentDay);

        return { status, periodInfo: period };
    }

    public GetFutureGroupStatuses(group: number, count: number) {
        const result: StatusForPeriod[] = [];

        const currentPeriod = this.GetCurrentPeriod();
        const currentDay = GetCurrentDay();

        for (let i = 0; i < count; i++) {
            const period = (currentPeriod + i) % 6;
            const day = (currentDay + Math.trunc((currentPeriod + i) / 6)) % 7;

            const status = this.GetGroupStatus(group, day, period);
            const periodInfo = this.GetPeriodInfo(period, day);
            const statusForPeriod: StatusForPeriod = {
                status,
                periodInfo,
            };

            result.push(statusForPeriod);
        }

        return result;
    }

    public GetPeriodInfo(period: number, day: Day): PeriodInfo {
        const start = (period * 4 + 1) % 24;
        const end = (start + 4) % 24;

        return { start, end, day };
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
