import * as Url from "url";
import * as Path from "path";
export class ElectronUtils {
    static path(filename:string) {
        return Url.format({
            protocol: "file:",
            pathname: Path.join(__dirname, filename),
            slashes: true
        });
    }
}

export class IPCEventType {
    public static readonly SPAWN_ENCODER:string = "m2a-spawn-encoder";
    public static readonly ENCODE_COMPLETED:string = "m2a-encode-completed";
    public static readonly APP_QUIT:string = "m2a-app-quit";
    public static readonly APP_OPEN_FILE:string = "m2a-open-file-dialog";
    public static readonly APP_FILE_SELECTED:string = "m2a-file-selected";
}