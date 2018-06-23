
/* tslint:disable:naming-convention */
export default class IPCEventType {

    // String literal types seem superfluos but they helper us detect accidental reassignments

    public static readonly APP_QUIT: "APP_QUIT"                                                   = "APP_QUIT";
    public static readonly MAIN_WINDOW_BLUR: "MAIN_WINDOW_BLUR"                                   = "MAIN_WINDOW_BLUR";
    public static readonly MAIN_WINDOW_FOCUS: "MAIN_WINDOW_FOCUS"                                 = "MAIN_WINDOW_FOCUS";
    public static readonly SHOW_DEV_TOOLS: "SHOW_DEV_TOOLS"                                       = "SHOW_DEV_TOOLS";
    public static readonly SPAWN_ENCODER: "m2a-spawn-encoder"                                     = "m2a-spawn-encoder";
    public static readonly ENCODE_COMPLETED: "m2a-encode-completed"                               = "m2a-encode-completed";
    public static readonly APP_OPEN_FILE: "m2a-app-open-file-dialog"                              = "m2a-app-open-file-dialog";
    public static readonly APP_SAVE_FILE: "m2a-app-save-file-dialog"                              = "m2a-app-save-file-dialog";
    public static readonly APP_FILE_SELECTED: "m2a-app-file-selected"                             = "m2a-app-file-selected";
    public static readonly APP_SAVE_FILE_SELECTED: "m2a-app-save-file-selected"                   = "m2a-app-save-file-selected";
    public static readonly APP_SHOW_STATISTICS: "m2a-app-show-stats"                              = "m2a-app-show-stats";
    public static readonly APP_OPEN_ENCODE_WINDOW: "APP_OPEN_ENCODE_WINDOW"                       = "APP_OPEN_ENCODE_WINDOW";
    public static readonly APP_CLOSE_ENCODE_WINDOW: "APP_CLOSE_ENCODE_WINDOW"                     = "APP_CLOSE_ENCODE_WINDOW";
    public static readonly APP_SHOW_DEV_TOOLS_ENCODE_WINDOW: "APP_SHOW_DEV_TOOLS_ENCODE_WINDOW"   = "APP_SHOW_DEV_TOOLS_ENCODE_WINDOW";
    public static readonly APP_ENCODE_WINDOW_READY: "APP_ENCODE_WINDOW_READY"                     = "APP_ENCODE_WINDOW_READY";

    public static readonly LOG_DEBUG: "LOG_DEBUG"     = "LOG_DEBUG";
    public static readonly LOG_INFO: "LOG_INFO"       = "LOG_INFO";
    public static readonly LOG_WARN: "LOG_WARN"       = "LOG_WARN";
    public static readonly LOG_SILLY: "LOG_SILLY"     = "LOG_SILLY";
    public static readonly LOG_ERROR: "LOG_ERROR"     = "LOG_ERROR";
    public static readonly LOG_VERBOSE: "LOG_VERBOSE" = "LOG_VERBOSE";
}
