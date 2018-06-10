import { ipcRenderer } from "electron";
import IPCEventType from "./Channels";
declare const window: any;

export enum KeyCode {
    BACKSPACE       = 8,
    DELETE          = 46,
    ALT             = 18,
    EQUALS          = 187,
    MINUS           = 189,
    ZERO            = 48,
    KEYPAD_PLUS     = 107,
    KEYPAD_MINUS    = 109,
    KEYPAD_ZERO     = 96,
    CONTROL         = 17,
    COMMAND_LEFT    = 91,
    COMMAND_RIGHT   = 93,
    SHIFT           = 16,
    Q               = 81,
    Z               = 90,
    Y               = 89,
    ARROW_UP        = 38,
    ARROW_DOWN      = 40,
    ARROW_LEFT      = 37,
    ARROW_RIGHT     = 39,

}

export enum MouseCode {
    LEFT            = 1,
    MIDDLE          = 2,
    RIGHT           = 3
}

export class KeyState {
    public static CtrlKeyDown: boolean = false;
    public static AltKeyDown: boolean = false;
    public static ShiftKeyDown: boolean = false;
    public static Init() {
        $(window).on("keydown", (e: JQuery.Event) => this.onKeyDown(e));
        $(window).on("keyup", (e: JQuery.Event) => this.onKeyUp(e));

        ipcRenderer.on(IPCEventType.MAIN_WINDOW_BLUR, this.onMainWindowFocusChange);
        ipcRenderer.on(IPCEventType.MAIN_WINDOW_FOCUS, this.onMainWindowFocusChange);
    }

    private static onMainWindowFocusChange(): void {
        this.CtrlKeyDown = false;
        this.AltKeyDown = false;
        this.ShiftKeyDown = false;
    }

    private static onKeyDown(e: JQuery.Event): void {
        switch (e.which) {
            case KeyCode.CONTROL:
            case KeyCode.COMMAND_LEFT:
            case KeyCode.COMMAND_RIGHT:
                if (this.CtrlKeyDown) { return; }
                e.preventDefault();
                this.CtrlKeyDown = true;
                break;
            case KeyCode.Q:
                if (!this.CtrlKeyDown) { return; }
                e.preventDefault();
                ipcRenderer.send(IPCEventType.APP_QUIT);
                break;
            default:
                return;
        }
    }

    private static onKeyUp(e: JQuery.Event): void {
        switch (e.which) {
            case KeyCode.CONTROL:
            case KeyCode.COMMAND_LEFT:
            case KeyCode.COMMAND_RIGHT:
                if (!this.CtrlKeyDown) { return; }
                this.CtrlKeyDown = false;
                break;
            default:
                return;
        }
    }
}