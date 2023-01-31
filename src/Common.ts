export enum Day {
    Sunday,
    Monday,
    Tuesday,
    Wednesday,
    Thursday,
    Friday,
    Saturday,
}

export enum ScenesEnum {
    MainScene = "Main",
    LightScheduleScene = "LightSchedule",
    LightScheduleSettingsScene = "LightScheduleSceneSettings",
}

export function GetCurrentDay(): Day {
    const date = new Date(Date.now());
    return date.getDay() % 7;
}

export const digitIcons = [
    "0️⃣",
    "1️⃣",
    "2️⃣",
    "3️⃣",
    "4️⃣",
    "5️⃣",
    "6️⃣",
    "7️⃣",
    "8️⃣",
    "9️⃣",
];

export function DigitsToIconsString(num: number, minLength: number = 0) {
    let result = "";

    const numString = num.toString();
    numString.split("").forEach((digit) => (result += digitIcons[+digit]));

    if (numString.length < minLength) {
        result = digitIcons[0].repeat(minLength - numString.length) + result;
    }

    return result;
}

export function FillCharacters(
    string: string,
    minLength: number,
    filler: string,
    addToEnd?: boolean
) {
    let result = string;

    if (string.length < minLength) {
        const fill = filler.repeat(minLength - string.length);
        result = addToEnd ? result + fill : fill + result;
    }

    return result;
}

export const Icon: Record<string, string> = {
    back: "⬅️",
    left: "◀️",
    right: "▶️",
    current: "⏳",
    calendar: "🗓",
    settings: "⚙️",
    mail: "📩",
    remove: "🚫",
    clock: "🕑",
};
