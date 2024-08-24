import express from "express";

import { jyupAPI } from "../api/jyupAPI.js";
import { GetResponse } from "../modules/getResponse.js";

const app = express.Router();
const getResponse = new GetResponse();
export default app;

const jyAPI = new jyupAPI();

const allowed: { [type: string]: string[] } = {
    files: ["", "index.html"],
    folders: ["src"]
};

const post: { path: string, func: (req: express.Request, res: express.Response) => any }[] = [
    { path: "/jyupAPI*", func: jyAPI.jyupAPI }
]

for (const type of Object.keys(allowed)) for (const name of allowed[type]) app.get("/" + name + (type === "folders" ? "*" : ""), async (req, res) => { await getResponse.getResponceAuto(req, res, "/siteSource/promisedLazy"); });
for (const data of post) app.post(data.path, data.func);