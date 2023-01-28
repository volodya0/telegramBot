import { Scenes, Markup } from "telegraf";
import { ScenesEnum } from "../Common";
import { IContext } from "../App";

enum Stage {
    SelectTime,
}

class LightScheduleSceneSettingsServices {
    public TimeVariants = [
        "At the moment",
        "1",
        "2",
        "5",
        "10",
        "15",
        "20",
        "30",
        "60",
    ];

    public GetTimeVariantsForKeyboard() {
        const result = [[this.TimeVariants[0]]];

        for (let i = 1; i < this.TimeVariants.length; i += 2) {
            result.push([this.TimeVariants[i], this.TimeVariants[i + 1]]);
        }

        return result;
    }
}
const services = new LightScheduleSceneSettingsServices();

export const LightScheduleSceneSettings = new Scenes.BaseScene<IContext>(
    ScenesEnum.LightScheduleSettingsScene
);

LightScheduleSceneSettings.enter((ctx) => {
    ctx.reply(`Chose what do you want to setup`, keyboard);
});

LightScheduleSceneSettings.hears("Subscribe to updates", (ctx) => {
    ctx.c.state.stage = Stage.SelectTime;
    ctx.reply(
        `Select the time before`,
        Markup.keyboard(services.GetTimeVariantsForKeyboard())
    );
});

LightScheduleSceneSettings.on("message", (ctx, next) => {
    const message = ctx.c.message;

    if (
        ctx.c.state.stage !== Stage.SelectTime ||
        !services.TimeVariants.includes(message)
    ) {
        return next();
    }

    ctx.c.SubscribeToScheduleUpdates(message);

    ctx.reply("Done", keyboard);
});

LightScheduleSceneSettings.hears("Back to schedule", (ctx) => {
    ctx.scene.enter(ScenesEnum.LightScheduleScene);
});

const keyboard = Markup.keyboard([
    [Markup.button.callback("Subscribe to updates", "Subscribe to updates")],
    [Markup.button.callback("Back to schedule", "Back to schedule")],
    // [Markup.button.callback("Back to main", "Back to main")],
]).selective();
