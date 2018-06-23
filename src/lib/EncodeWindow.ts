declare var window: any;
import { ipcRenderer, remote } from "electron";
import IPCEventType from "./Channels";
import { Config } from "./Config";
import { EncodeController } from "./EncodeController";
import { KeyState } from "./InputState";

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
    $btnQuit.click((e: JQuery.Event) =>            { ipcRenderer.send(IPCEventType.APP_CLOSE_ENCODE_WINDOW); });
    $btnDevTools.click((e: JQuery.Event) =>        { ipcRenderer.send(IPCEventType.APP_SHOW_DEV_TOOLS_ENCODE_WINDOW); });
    EncodeController.Init();
    ipcRenderer.send(IPCEventType.APP_ENCODE_WINDOW_READY);
});
