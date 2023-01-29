import { firebaseConfig } from "./Config";
import firebase from "firebase";

export enum Setting {
    lightScheduleSubscribeTimeVariant,
}
interface UserSettingRecord {
    [Setting.lightScheduleSubscribeTimeVariant]?: string;
}

interface UserUpdatesRecord {
    updates: string[];
}

type UserSettings = Record<number, UserSettingRecord>;
type UserUpdates = Record<number, UserUpdatesRecord>;
type State = Record<number, any>;

interface Statistic {
    messagesCount: number;
}

interface DataBaseView {
    userSettings: UserSettings;
    userUpdates: UserUpdates;
    statistic: Statistic;
}

export class Data {
    private firebase = new Firebase();

    private userSettings!: UserSettings;
    private userUpdates!: UserUpdates;
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

    public SetState(userId: number, state: Record<string, any>) {
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

    public AddUserUpdate(userId: number, update: string) {
        if (!this.userUpdates[userId]) {
            this.userUpdates[userId] = { updates: [] };
        }

        this.userUpdates[userId].updates.push(update);

        this.refreshFirebase();
    }

    public GetStatistic() {
        return this.statistic.messagesCount;
    }

    public async asyncInit() {
        const data = (await this.firebase.GetData()).val() ?? {};
        const { statistic, userSettings, userUpdates } = (data ??
            {}) as DataBaseView;

        this.statistic = statistic ?? { messagesCount: 0 };
        this.userUpdates = userUpdates ?? {};
        this.userSettings = userSettings ?? {};

        this.refreshFirebase();
    }

    public refreshFirebase() {
        this.firebase.Set({
            userSettings: this.userSettings,
            userUpdates: this.userUpdates,
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

    public Set(data: DataBaseView) {
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
            .then(function (snapshot: DataBaseView) {
                return snapshot;
            });
    }
}
