export enum Day {
    Sunday,
    Monday,
    Tuesday,
    Wednesday,
    Thursday,
    Friday,
    Saturday,
}

export const SecondsPerDay = 86_400;

export function GetCurrentDay(): Day {
    const date = new Date(Date.now());
    return date.getDate();
}

export function GetCurrentTimeSeconds() {
    var date = new Date();
    date.setHours(0, 0, 0, 0);
    var diff = +date - new Date().setHours(0, 0, 0, 0);
    return Math.floor(diff / 1000);
}
