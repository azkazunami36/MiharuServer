import express from "express";
import { GetResponse } from "../modules/getResponse.js";
import { musicPlayerAPI } from "../api/musicPlayerAPI.js";
import { promisedLazyAPI } from "../api/promisedLazyAPI.js";
import { reCaptchaAPI } from "../api/reCaptchaAPI.js";

const app = express.Router();
const getResponse = new GetResponse();
export default app;

getResponse.errorHtmlPath[404] = "./siteSource/src/error404/index.html";
getResponse.errorHtmlPath[500] = "./siteSource/src/error404/index.html";

const mpAPI = new musicPlayerAPI();
const plAPI = new promisedLazyAPI();
const rcAPI = new reCaptchaAPI();

const allowed: { [type: string]: string[] } = {
    files: ["", "index.html"],
    folders: ["src"]
};

const post: { path: string, func: (req: express.Request, res: express.Response) => any }[] = [
    { path: "/musicPlayerAPI*", func: mpAPI.musicPlayerAPI },
    { path: "/reCaptchaAPI*", func: rcAPI.reCaptchaAPI }
]

for (const type of Object.keys(allowed)) for (const name of allowed[type]) app.get("/" + name + (type === "folders" ? "*" : ""), async (req, res) => { await getResponse.getResponceAuto(req, res, "/siteSource/medfom"); });
for (const data of post) app.post(data.path, data.func);

app.get("*", (req, res) => { getResponse.error(req, res, 404); });
