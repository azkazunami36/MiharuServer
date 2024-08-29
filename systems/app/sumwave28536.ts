import express from "express";
import { marked } from "marked";

import { GetResponse } from "../modules/getResponse.js";
import { musicPlayerAPI } from "../api/musicPlayerAPI.js";
import { promisedLazyAPI } from "../api/promisedLazyAPI.js";
import { reCaptchaAPI } from "../api/reCaptchaAPI.js";
import { jyupAPI } from "../api/jyupAPI.js";

const app = express.Router();
const getResponse = new GetResponse();
export default app;

getResponse.errorHtmlPath[404] = "./siteSource/src/error404/index.html";
getResponse.errorHtmlPath[500] = "./siteSource/src/error404/index.html";

const mpAPI = new musicPlayerAPI();
const plAPI = new promisedLazyAPI();
const rcAPI = new reCaptchaAPI();
const jyAPI = new jyupAPI();

const allowed: { [type: string]: string[] } = {
    files: ["", "index.html"],
    folders: ["home", ".well-known", "bulletinBoard", "donate", "novel", "promisedLazy", "request", "SW36", "WebOS", "games", "login", "createAccount", "src", "serverStatus", "accountManage"]
};

const post: { path: string, func: (req: express.Request, res: express.Response) => any }[] = [
    { path: "/mdToHTML*", func: (req, res) => { if (req.body) { res.end(marked.parse(String(req.body))); } else { res.status(500); res.end(); }; } },
    { path: "/musicPlayerAPI*", func: mpAPI.musicPlayerAPI },
    { path: "/promisedLazyAPI*", func: plAPI.promisedLazyAPI },
    { path: "/reCaptchaAPI*", func: rcAPI.reCaptchaAPI },
    { path: "/jyupAPI*", func: jyAPI.jyupAPI }
]

for (const type of Object.keys(allowed)) for (const name of allowed[type]) app.get("/" + name + (type === "folders" ? "*" : ""), async (req, res) => { await getResponse.getResponceAuto(req, res, "/siteSource"); });
for (const data of post) app.post(data.path, data.func);

app.get("*", (req, res) => { getResponse.error(req, res, 404); });