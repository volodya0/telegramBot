import { Markup, Scenes, Telegraf } from "telegraf";
import { ScenesEnum } from "../Common";

export const MainScene = new Scenes.BaseScene<Scenes.SceneContext>(
    ScenesEnum.MainScene
);

MainScene.enter((ctx) => {
    ctx.reply("Hi it is main scene", mainKeyboard);
});

MainScene.leave((ctx) => {
    ctx.reply("You leave main scene");
});

MainScene.hears("Light schedule", (ctx) => {
    ctx.scene.enter(ScenesEnum.LightScheduleScene);
});

MainScene.on("message", (ctx) => {
    ctx.reply("main");
});

const mainKeyboard = Markup.keyboard([
    Markup.button.callback("Light schedule", ScenesEnum.LightScheduleScene),
    Markup.button.callback("None", "None"),
]);
