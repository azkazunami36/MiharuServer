import express from "express";

export class promisedLazyAPI {
    constructor() {}
    promisedLazyAPI(req: express.Request, res: express.Response) {
        res.end();
    }
}