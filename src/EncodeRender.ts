import {remote, ipcRenderer} from 'electron';
import {IPCEventType} from './ElectronUtils';
const BrowserWindow = remote.BrowserWindow;

ipcRenderer.on(IPCEventType.SPAWN_ENCODER, function(event, message, fromWindowId) {
    document.getElementById('message').innerText = message;
    const fromWindow = BrowserWindow.fromId(fromWindowId);
    fromWindow.webContents.send(IPCEventType.ENCODE_COMPLETED)
});