declare var window: any;
import { ipcRenderer, remote } from "electron";
import IPCEventType from "./Channels";
import { Config } from "./Config";
import { KeyState } from "./InputState";
import { MainController } from "./MainController";

window.Config = Config;

const
    $btnMinimise = $("#btnMinimise"),
    $btnMaximise = $("#btnMaximise"),
    $btnQuit = $("#btnQuit"),
    $btnDevTools = $("#btnDevTools")
;

$(document).ready(() => {
    KeyState.Init();
    $btnMinimise.click((e: JQuery.Event) =>        { remote.getCurrentWindow().minimize(); });
    $btnMaximise.click((e: JQuery.Event) =>        { (remote.getCurrentWindow().isMaximized()) ? remote.getCurrentWindow().unmaximize() : remote.getCurrentWindow().maximize(); });
    $btnQuit.click((e: JQuery.Event) =>            { ipcRenderer.send(IPCEventType.APP_QUIT); });
    $btnDevTools.click((e: JQuery.Event) =>        { ipcRenderer.send(IPCEventType.SHOW_DEV_TOOLS); });
    $("#info-tabs").on("click", function(e) {
        e.preventDefault();
        $(this).tab("show");
    });
    MainController.Init();
});
