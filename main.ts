import fs from "fs";
import http from "http";
import https from "https";
import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";

import { GetResponse } from "./systems/modules/getResponse.js";
import sumwave28536App from "./systems/app/sumwave28536.js";
import promisedLazyApp from "./systems/app/promisedLazy.js";
import UserManageApp from "./systems/app/userManage.js"

const getResponse = new GetResponse();
const userManageApp = new UserManageApp();

dotenv.config();

const app = express();

const httpsMode = true;
const server = httpsMode ? https.createServer({ key: String(fs.readFileSync("./keyData/letsencrypt32748115.key")), cert: String(fs.readFileSync("./keyData/letsencrypt32748115.crt")) }, app) : http.createServer(app);

getResponse.setAppUse(app);
server.listen(httpsMode ? "443" : "80", () => { console.log("準備が完了しました。アクセスして利用することができます。") });

app.use(helmet())

app.use(helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "www.google.com", "www.gstatic.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
      imgSrc: ["'self'", "cdn.discordapp.com"],
      connectSrc: ["'self'"],
      fontSrc: ["'self'", "fonts.gstatic.com"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
      frameSrc: ["'self'", "www.google.com"]
    },
  }));

app.post("/userRequest*", userManageApp.userManage);

app.use((req, res, next) => {
    req.ip
    req.headers["user-agent"]
    switch (req.hostname) {
        case "sumwave28536.com": sumwave28536App(req, res, next); break;
        default: sumwave28536App(req, res, next); break;
    };
});