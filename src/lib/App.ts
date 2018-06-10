import { app } from "electron";

import Main from "./Main";


console.log(app.getAppPath());
Main.Init(app);
