import * as path from "path";
import * as url from "url";
import {Config} from "./Config";

/**
 * Contains utility functions that require electron as a dependency
 */
export class ElectronUtils {
    /**
     * Joins a relative path to the APP root
     * @param filepath the path to prepend with app root
     */
    public static GetRootPath(filepath: string): string {
        return url.format({
            protocol: "file:",
            pathname: path.join(Config.System.AppDistRoot, filepath),
            slashes: true
        });
    }

    /**
     * Gets a HTML template from the views directory
     * @param template the path to prepend with template root
     */
    public static GetTemplate(template: string): string {
        return url.format({
            pathname: path.join(Config.System.TemplateRoot, template),
            protocol: "file",
            slashes: true
        });
    }

    public static IsDev(): boolean {
        return (process && process.env.hasOwnProperty("NODE_ENV") && process.env.NODE_ENV.indexOf("dev") !== -1);
    }

}
