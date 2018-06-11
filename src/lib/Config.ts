import * as fs from "fs";
import cloneDeep = require("lodash.clonedeep");
import merge = require("lodash.merge");
import * as path from "path";
import { IConfig, IConfigLogging, IConfigSystem } from "./typings/config";

const isMain = (process && process.type !== "renderer");
const app = (isMain) ? require("electron").app : require("electron").remote.app;

const defaultConfigPath: string = path.join(app.getAppPath(), "config", "default.json");

export class CConfig implements IConfig {
    [key: string]: any;
    public Logging: IConfigLogging;
    public System: IConfigSystem;
    private pojo: IConfig;
    private readonly sections: string[] = ["Logging", "System"];
    private readonly excludedProps: any = {
        System: [
            "UserConfigPath",
            "UserDataFolder",
            "UserTempFolder",
            "UserDesktopFolder",
            "UserDocumentsFolder",
            "UserDownloadsFolder",
            "UserHomeFolder",
            "UserLogFolder",
            "Version",
            "AppDistRoot",
            "AppRoot",
            "Package",
            "TemplateRoot",
            "FFMpegBinary",
            "FFProbeBinary"
        ],
        Logging: [
            "SavePath"
        ]
    };

    constructor(config: IConfig) {
        this.pojo = cloneDeep(config);
        this.Logging = config.Logging;
        this.System = config.System;
    }

    public ToString(): string {
        return JSON.stringify(this.pojo, null, 2);
    }

    public SaveUserConfig(): void {
        const output: any = { Logging: {}, System: {} };
        for (const section of this.sections) {

            if (!this.hasOwnProperty(section)) { continue; }

            for (const key in this[section]) {

                if (!this[section].hasOwnProperty(key) || (this.excludedProps.hasOwnProperty(section) && this.excludedProps[section].includes(key))) { continue; }
                output[section][key] = this[section][key];
            }
        }

        fs.writeFileSync(this.System.UserConfigPath, JSON.stringify(output, null, 2), { encoding: "utf-8" });
    }

    /**
     * Changes a configuration setting
     * @param propPath A string representing a key path on the Config object e.g. "System.IsDev"
     * @param value the value to set
     */
    public Set(propPath: string, value: any): void {
        const keys = propPath.split(".");
        if (keys.length === 1) { return; } // There are no top level settable values so do nothing

        if (keys.length === 2) {
            this[keys[0]][keys[1]] = value;
        } else {
            this[keys[0]][keys[1]][keys[2]] = value;
        }
    }

    /**
     * Gets a configuration setting from a key path
     * @param propPath A string representing a key path on the Config object e.g. "System.IsDev"
     */
    public Get(propPath: string): any {
        const keys = propPath.split(".");
        if (keys.length === 1) { return null; } // There are no top level gettable values so return null

        if (keys.length === 2) {
            return this[keys[0]][keys[1]];
        } else {
            return this[keys[0]][keys[1]][keys[2]];
        }
    }

    /**
     * Return a deep copy of the original object
     */
    public ToObject(): IConfig {
        return cloneDeep(this.pojo);
    }

    public ResetDefault(): CConfig {
        const newConfig = CConfig.GetDefault();
        this.System = newConfig.System;
        this.Logging = newConfig.Logging;
        return this;
    }

    /**
     * Loads the default config from disk, adds all the runtime values and returns it.
     */
    public static GetDefault(): IConfig {
        /** Load the config files */
        const defaultConfig: IConfig = JSON.parse(fs.readFileSync(defaultConfigPath, { encoding: "utf-8" }));
        /** Get System Specific folders */
        defaultConfig.System.AppRoot =                  app.getAppPath();
        defaultConfig.System.AppDistRoot =              path.resolve(path.join(defaultConfig.System.AppRoot, "dist"));
        defaultConfig.System.Package =                  require(path.join(defaultConfig.System.AppRoot, "package.json"));
        defaultConfig.System.TemplateRoot =             path.resolve(path.join(defaultConfig.System.AppDistRoot, "views"));
        defaultConfig.System.UserDataFolder =           app.getPath("userData");
        defaultConfig.System.UserTempFolder =           app.getPath("temp");
        defaultConfig.System.UserDesktopFolder =        app.getPath("desktop");
        defaultConfig.System.UserHomeFolder =           app.getPath("home");
        defaultConfig.System.UserDocumentsFolder =      app.getPath("documents");
        defaultConfig.System.UserLogFolder =            app.getPath("logs");
        defaultConfig.System.UserConfigPath =           path.join(defaultConfig.System.UserDataFolder, "user.json");
        defaultConfig.System.FFMpegBinary =             path.join(defaultConfig.System.AppRoot, "ffmpeg/bin/ffmpeg");
        defaultConfig.System.FFProbe =                  path.join(defaultConfig.System.AppRoot, "ffmpeg/bin/ffprobe");
        defaultConfig.Logging.SavePath =                path.join(defaultConfig.System.UserLogFolder, defaultConfig.Logging.File.Filename);

         /** Get the current app version */
        defaultConfig.System.Version = defaultConfig.System.Package.version;

        return defaultConfig;
    }

    public static Init(): CConfig {

        const defaultConfig = CConfig.GetDefault();
        /** Create User Config file if it doesnt exist */
        if (!fs.existsSync(defaultConfig.System.UserConfigPath)) {
            fs.writeFileSync(
                defaultConfig.System.UserConfigPath,
                fs.readFileSync(defaultConfigPath, { encoding: "utf-8" })
            );
        }

        /** Load the user config file, init the default Config and merge */
        const userConfig: IConfig = JSON.parse(fs.readFileSync(defaultConfig.System.UserConfigPath, { encoding: "utf-8" }));
        const mergedConfig = merge({}, defaultConfig, userConfig);
        const appConfig = new CConfig(mergedConfig);

        /** determine if we want dev functionality available or not - Precedence (from high to low) is: User Config Setting, NODE_ENV variable */
        appConfig.System.IsDev =
            (appConfig.System.IsDev) ?
                true : ((typeof process.env.NODE_ENV !== "undefined") && (process.env.NODE_ENV !== "") && (process.env.NODE_ENV.toLowerCase().indexOf("dev") > -1)) ?
                    true : false;

        /** Save the finalConfig out to ensure any new values added to default.json are now in user.json */
        appConfig.SaveUserConfig();
        return appConfig;
    }
}

const finalConfig = CConfig.Init();
export { finalConfig as Config };
