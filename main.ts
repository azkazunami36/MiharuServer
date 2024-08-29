import fs from "fs";
import http from "http";
import https from "https";
import express from "express";
import dotenv from "dotenv";
import helmet from "helmet";
// 自作モジュール
import { GetResponse } from "./systems/modules/getResponse.js";
import sumwave28536App from "./systems/app/sumwave28536.js";
import promisedLazyApp from "./systems/app/promisedLazy.js";
import UserManageApp from "./systems/app/userManage.js"

// 定義
const getResponse = new GetResponse();
const userManageApp = new UserManageApp();
dotenv.config();
// User Manageプログラムの初期化
userManageApp.userIndex.readJSON().then(() => {
    // メインapp
    const app = express();
    // サーバーをセッティング(httpかhttpsかをここで決めています。)
    const httpsMode = true;
    const server = httpsMode ? https.createServer({ key: String(fs.readFileSync("./keyData/letsencrypt32748115.key")), cert: String(fs.readFileSync("./keyData/letsencrypt32748115.crt")) }, app) : http.createServer(app);
    // サーバーの初期化
    if (httpsMode) { const app = express(); app.listen("80"); app.use(function (req, res) { res.redirect("https://" + req.hostname + req.originalUrl); }); } else { };
    // サーバの起動
    getResponse.setAppUse(app);
    server.listen(httpsMode ? "443" : "80", () => { console.log("準備が完了しました。アクセスして利用することができます。") });
    // helmet
    app.use(helmet())
    app.use(helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "www.google.com", "www.gstatic.com", "'unsafe-eval'"],
            styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
            imgSrc: ["'self'", "cdn.discordapp.com", "david.li"],
            connectSrc: ["'self'"],
            fontSrc: ["'self'", "fonts.gstatic.com"],
            objectSrc: ["'none'"],
            upgradeInsecureRequests: [],
            frameSrc: ["'self'", "www.google.com"]
        }
    }));
    // User RequestPOSTを受け入れる場所。どのような時でもこのURLを使うとこのPostを通すようにしています。
    app.post("/userRequest*", async (req, res) => { await userManageApp.userManage(req, res) });
    // 様々なアプリをドメインごとに処理するようにする、ルーティング機能です。
    app.use((req, res, next) => {
        req.ip; req.headers["user-agent"];
        switch (req.hostname) {
            case "sumwave28536.com": sumwave28536App(req, res, next); break;
            default: sumwave28536App(req, res, next); break;
        };
    });

});
