import { ipcRenderer, remote } from "electron";
import * as log from "electron-log";
import IPCEventType from "./Channels";
import { KeyState } from "./InputState";

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

});
