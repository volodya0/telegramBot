import { firebaseConfig } from "./Config";
import firebase from "firebase";

export enum Setting {
    lightScheduleSubscribeTimeVariant,
}

export interface StateRecord {
    stage?: number;
}

interface UserSettingRecord {
    [Setting.lightScheduleSubscribeTimeVariant]?: string;
}

type UserSettings = Record<number, UserSettingRecord>;
type State = Record<number, StateRecord>;

interface Statistic {
    messagesCount: number;
}

interface DataBaseData {
    userSettings: UserSettings;
    statistic: Statistic;
}

export class Data {
    private firebase = new Firebase();

    private userSettings!: UserSettings;
    private statistic!: Statistic;
    private state: State;

    constructor() {
        this.state = {};
    }

    public GetSettings(userId: number, setting: Setting) {
        if (!this.userSettings[userId]) {
            this.userSettings[userId] = {};
        }

        return this.userSettings[userId][setting];
    }

    public SetSettings(userId: number, setting: Setting, value: string) {
        if (!this.userSettings[userId]) {
            this.userSettings[userId] = {};
        }

        this.userSettings[userId][setting] = value;

        this.refreshFirebase();
    }

    public GetState(userId: number) {
        if (!this.state[userId]) {
            this.state[userId] = {};
        }

        return this.state[userId];
    }

    public SetState(userId: number, state: Partial<StateRecord>) {
        if (!this.state[userId]) {
            this.state[userId] = {};
        }

        this.state[userId] = { ...this.state[userId], ...state };

        this.refreshFirebase();
    }

    public UpdateStatistic() {
        this.statistic.messagesCount++;

        this.refreshFirebase();
    }

    public GetStatistic() {
        return this.statistic.messagesCount;
    }

    public async asyncInit() {
        const data = (await this.firebase.GetData()).val() ?? {};
        const { statistic, userSettings } = data ?? {};

        this.statistic = statistic ?? { messagesCount: 0 };
        this.userSettings = userSettings ?? {};

        this.refreshFirebase();
    }

    public refreshFirebase() {
        this.firebase.Set({
            userSettings: this.userSettings,
            statistic: this.statistic,
        });
    }
}

class Firebase {
    private db: any;
    constructor() {
        firebase.initializeApp(firebaseConfig);
        this.db = firebase.database();
    }

    public Set(data: DataBaseData) {
        this.db.ref("data").set(data, function (error: string) {
            if (error) {
                console.log("Failed with error: " + error);
            } else {
                console.log("success");
            }
        });
    }

    public GetData() {
        return this.db
            .ref("data")
            .once("value")
            .then(function (snapshot: DataBaseData) {
                return snapshot;
            });
    }
}
