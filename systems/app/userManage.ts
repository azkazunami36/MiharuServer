import express from "express";
import fs from "fs";

export class userManage {
    constructor() {}
    userManage(req: express.Request, res: express.Response) {

        const post: { path: string, func: () => any }[] = []
        for (const data of post) {
            data.func();
            break;
        }
        res.writeHead(404);
        res.end();
    }
}
export default userManage;