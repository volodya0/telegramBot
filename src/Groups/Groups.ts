import {
    Day,
    GetCurrentDay,
    GetCurrentTimeSeconds,
    SecondsPerDay,
} from "../common";

export enum Status {
    Green,
    White,
    Red,
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
        const periodsCount = this.cityGroupsSchedule.PeriodsCount;
        const secondsPerPeriod = SecondsPerDay / periodsCount;
        const currentSeconds = GetCurrentTimeSeconds();
        const result = (currentSeconds / secondsPerPeriod) % periodsCount;

        return result;
    }

    public GetCurrentStatus(group: number) {
        const currentDay = GetCurrentDay();
        const currentPeriod = this.GetCurrentPeriod();

        const result = this.cityGroupsSchedule.GetStatus(
            currentDay,
            group,
            currentPeriod
        );

        return result;
    }
}
