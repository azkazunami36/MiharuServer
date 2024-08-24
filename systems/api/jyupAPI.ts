import express from "express";
import fs from "fs";

export class jyupAPI {
    constructor() {}
    jyupAPI(req: express.Request, res: express.Response) {
        res.writeHead(404);
        res.end();
    }
}