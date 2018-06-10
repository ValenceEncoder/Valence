import { app } from "electron";

import Main from "./Main";

// tslint:disable-next-line:no-console
console.log(app.getAppPath());
Main.Init(app);
