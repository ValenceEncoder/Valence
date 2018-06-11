
/* tslint:disable:naming-convention */
export default class IPCEventType {
    public static readonly APP_QUIT: string = "APP_QUIT";
    public static readonly MAIN_WINDOW_BLUR: string = "MAIN_WINDOW_BLUR";
    public static readonly MAIN_WINDOW_FOCUS: string = "MAIN_WINDOW_FOCUS";
    public static readonly SHOW_DEV_TOOLS: string = "SHOW_DEV_TOOLS";
    public static readonly SPAWN_ENCODER: string = "m2a-spawn-encoder";
    public static readonly ENCODE_COMPLETED: string = "m2a-encode-completed";
    public static readonly APP_OPEN_FILE: string = "m2a-app-open-file-dialog";
    public static readonly APP_SAVE_FILE: string = "m2a-app-save-file-dialog";
    public static readonly APP_FILE_SELECTED: string = "m2a-app-file-selected";
    public static readonly APP_SAVE_FILE_SELECTED: string = "m2a-app-save-file-selected";
    public static readonly APP_SHOW_STATISTICS: string = "m2a-app-show-stats";
}
