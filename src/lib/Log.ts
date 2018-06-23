import Callsite = require("callsite");
import { Colours } from "colours-ts";
import path = require("path");

const isMain = () => (process && process.type !== "renderer");

export interface IValenceLog {
    debug: LogFunction;
    info: LogFunction;
    error: LogFunction;
    warn: LogFunction;
    log: LogFunction;
}

export type LogFunction = (...params: any[]) => void;
export type LogChannel = "LOG_DEBUG" | "LOG_INFO" | "LOG_SILLY" | "LOG_ERROR" | "LOG_WARN" | "LOG_VERBOSE";

const newLog: IValenceLog = {
    debug: console.debug,
    info: console.info,
    error: console.error,
    warn: console.warn,
    log: console.log
};

/**
 * log.transport is only available in the Main Process so we add a guard here.
 * @link https://github.com/megahertz/electron-log#renderer-process
 */

const overrideLog = (old: LogFunction, name: string): LogFunction => {
    if (isMain()) {
        return (...params: any[]) => {
            const call = Callsite();
            const stack = call[1];
            const caller = stack.getFunctionName();
            const file = stack.getFileName();
            old(`${Colours(path.basename(file), "cyan")} ${Colours(caller, "yellow")}`, ...params);
        };
    }
    return (...params: any[]) => {
        const call = Callsite();
        const stack = call[1];
        const caller = stack.getFunctionName();
        const file = stack.getFileName();
        old(`%c${path.basename(file)}::` + `%c${caller}`, "color: #1F9DCD;", "color: #CD653D;", ...params);
    };
};

const debug = (typeof console.debug === "undefined") ? console.log : console.debug;
newLog.debug = overrideLog(debug, "debug");
newLog.info  = overrideLog(console.info,  "info");
newLog.error = overrideLog(console.error, "error");
newLog.warn  = overrideLog(console.warn,  "warn");
newLog.log   = overrideLog(console.log,   "log");

export { newLog as log };
