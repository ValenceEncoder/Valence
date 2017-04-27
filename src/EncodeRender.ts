import {remote, ipcRenderer} from 'electron';
import IPCEventTypes from './AppConsts';
const BrowserWindow = remote.BrowserWindow;

ipcRenderer.on(IPCEventTypes.SPAWN_ENCODER, function(event, message, fromWindowId) {
    document.getElementById('message').innerText = message;
    const fromWindow = BrowserWindow.fromId(fromWindowId);
    fromWindow.webContents.send(IPCEventTypes.ENCODE_COMPLETED)
});