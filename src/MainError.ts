import * as Electron from "electron";
import {ipcRenderer} from "electron";
import {IPCEventType} from "./ElectronUtils";
import {EventEmitter} from "events";
import Main from "./Main";


export default class MainError {
    private static divErrorOverlay:HTMLElement;
    private static divErrorMessage:HTMLElement;
    private static btnErrorClose:HTMLElement;

    public static showError(message:string) {
        MainError.divErrorOverlay = <HTMLDivElement> document.getElementById("err-dialog");
        MainError.divErrorMessage = <HTMLDivElement> document.getElementById("err-message");
        MainError.btnErrorClose = <HTMLButtonElement> document.getElementById("btn-err-close");

        MainError.divErrorOverlay.classList.remove("display-none");
        MainError.divErrorOverlay.classList.add("flex-container");
        MainError.divErrorMessage.innerText = message;
        MainError.btnErrorClose.addEventListener('click', MainError.closeError);
    }


    public static closeError() {
        MainError.btnErrorClose.removeEventListener('click', MainError.closeError);
        MainError.divErrorOverlay.classList.add("display-none");
        MainError.divErrorOverlay.classList.remove("flex-container");
        MainError.divErrorMessage.innerText = "";
    }


}






