import fs from "fs";
import http from "http";
import https from "https";
import express from "express";
import helmet from "helmet";
import tls from "tls";

import { GetResponse } from "../modules/getResponse.js";
import UserManageApp from "../app/userManage.js";

/** SSLファイルの設定やサーバーの起動、Helmetの設定などをしています。 */
export function serverStartup(app: express.Express, getResponse: GetResponse, userManageApp: UserManageApp) {const httpsMode = true;
    const sslFileName = ["kazunami36.com", "medfom.com", "sumwave.net", "miharu.blog", "sumwave28536.com", "repezen.online", "solfa.online"];
    const sslFileDefault = "kazunami36.com";
    function certGet(domain: string) {
        let path;
        for (const filename of sslFileName) if (domain === filename || domain === "www." + filename) path = "./keyData/" + filename.split(".")[0];
        if (!path) path = "./keyData/" + sslFileDefault.split(".")[0];
        return {
            key: String(fs.readFileSync(path + ".key")),
            cert: String(fs.readFileSync(path + ".crt"))
        };
    }
    const options = {
        SNICallback: (domain: string, callback: (err: Error | null, ctx?: tls.SecureContext) => void) => {
            const cert = certGet(domain);
            if (cert) callback(null, tls.createSecureContext(cert));
            else callback(new Error("No SSL certificate found for domain: " + domain));
        },
        key: String(fs.readFileSync("./keyData/" + sslFileDefault.split(".")[0] + ".key")),
        cert: String(fs.readFileSync("./keyData/" + sslFileDefault.split(".")[0] + ".crt"))
    };
    const server = httpsMode ? https.createServer(options, app) : http.createServer(app);
    // サーバーの初期化
    if (httpsMode) { const app = express(); app.listen("80"); app.use(function (req, res) { res.redirect("https://" + req.hostname + req.originalUrl); }); } else { };
    // サーバの起動
    getResponse.setAppUse(app);
    server.listen(httpsMode ? "443" : "80", () => { console.log("準備が完了しました。アクセスして利用することができます。") });
    // helmet
    app.use(helmet());
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

    getResponse.errorHtmlPath[404] = "./siteSource/src/error404/index.html";
    getResponse.errorHtmlPath[500] = "./siteSource/src/error404/index.html";
    // Share Sourceは静的なファイルをどのドメインからでもアクセスできるように設置したものです。
    app.get("/sharesrc", async (req, res) => { await getResponse.getResponceAuto(req, res, "/sharesrc"); })
}

export default serverStartup;
