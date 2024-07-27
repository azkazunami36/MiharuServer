import express from "express";
import fs from "fs";

export class musicPlayerAPI {
    json
    constructor() {
        this.json = JSON.parse(String(fs.readFileSync("./systemDatas/musicPlayerAPI/data.json")));
    }
    musicPlayerAPI(req: express.Request, res: express.Response) {

        const post: { path: string, func: () => any }[] = [
        ]
        for (const data of post) {
            data.func();
            break;
        }
        res.writeHead(404);
        res.end();
    }
}