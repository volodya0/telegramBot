import { Day } from "../../Common";
import { CityGroupsScheduleBase, Status as GroupStatus } from "../Groups";

export enum Group {
    First,
    Second,
    Third,
}

type GroupsStartStatus = [GroupStatus, GroupStatus, GroupStatus];

class DaysSchedule {
    private readonly groupsStartStatus: GroupsStartStatus;

    constructor(groupsStartStatus: GroupsStartStatus) {
        this.groupsStartStatus = groupsStartStatus;
    }

    getStatus(group: Group, period: number): GroupStatus {
        const groupStartStatus = this.groupsStartStatus[group];
        const groupStatusForPeriod = (groupStartStatus + period) % 3;

        return groupStatusForPeriod;
    }
}

export class LvivGroups implements CityGroupsScheduleBase {
    private readonly schedules: Record<Day, DaysSchedule> = {} as any;
    public PeriodsCount: number = 6;

    constructor() {
        this.init();
    }

    public GetStatus(day: Day, group: Group, period: number): GroupStatus {
        const daySchedule = this.schedules[day];
        const result = daySchedule.getStatus(group, period);

        return result;
    }

    private init() {
        const daysSchedule1 = new DaysSchedule([
            GroupStatus.Red,
            GroupStatus.Green,
            GroupStatus.White,
        ]);

        const daysSchedule2 = new DaysSchedule([
            GroupStatus.Green,
            GroupStatus.White,
            GroupStatus.Red,
        ]);

        const daysSchedule3 = new DaysSchedule([
            GroupStatus.White,
            GroupStatus.Red,
            GroupStatus.Green,
        ]);

        this.schedules[Day.Monday] = daysSchedule1;
        this.schedules[Day.Tuesday] = daysSchedule2;
        this.schedules[Day.Wednesday] = daysSchedule3;
        this.schedules[Day.Thursday] = daysSchedule1;
        this.schedules[Day.Friday] = daysSchedule2;
        this.schedules[Day.Saturday] = daysSchedule3;
    }
}
