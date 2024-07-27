import express from "express";

import { promisedLazyAPI } from "../api/promisedLazyAPI.js";
import { GetResponse } from "../modules/getResponse.js";

const app = express.Router();
const getResponse = new GetResponse();
export default app;

const plAPI = new promisedLazyAPI();

const allowed: { [type: string]: string[] } = {
    files: ["", "index.html"],
    folders: ["src"]
};

const post: { path: string, func: (req: express.Request, res: express.Response) => any }[] = [
    { path: "/promisedLazyAPI*", func: plAPI.promisedLazyAPI }
]

for (const type of Object.keys(allowed)) for (const name of allowed[type]) app.get("/" + name + (type === "folders" ? "*" : ""), async (req, res) => { await getResponse.getResponceAuto(req, res, "/siteSource/promisedLazy"); });
for (const data of post) app.post(data.path, data.func);