import { INPMPackage } from "./package";

export interface IConfigLogConsole {
    Format?: string;
    Enabled: boolean;
    Level: "error" | "warn" | "info" | "verbose" | "debug" | "silly";
    [key: string]: any;
}

export interface IConfigLogFile extends IConfigLogConsole {
    Filename: string;
    [key: string]: any;
}

export interface IConfigLogging {
    File: IConfigLogFile;
    Console: IConfigLogConsole;
    SavePath: string;
    [key: string]: any;
}

export interface IConfigSystem {
    AppDistRoot: string;
    AppRoot: string;
    Package: INPMPackage;
    TemplateRoot: string;
    UserConfigPath: string;
    UserDataFolder: string;
    UserTempFolder: string;
    UserDesktopFolder: string;
    UserDocumentsFolder: string;
    UserDownloadsFolder: string;
    UserHomeFolder: string;
    UserLogFolder: string;
    Version: string;
    IsDev: boolean;
    ShowDeveloperTools: boolean;
    FFMpegBinary: string;
    FFProbeBinary: string;
    [key: string]: any;
}

export interface IConfig {
    Logging: IConfigLogging;
    System: IConfigSystem;
    ToString?(): string;
    ToObject?(): IConfig;
    Set?(propPath: string, value: any): void;
    Get?(propPath: string): any;
    SaveUserConfig?(): void;
    [key: string]: any;
}
