import { Beload } from "beload";
import { app } from "electron";
import Main from "./Main";

const reloader = new Beload(["../**/*", "../../css/**/*"], app, "change", {verbose: true});
Main.Init(app);
