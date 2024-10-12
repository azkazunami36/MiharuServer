import express from "express";

import sumwave28536App from "../app/sumwave28536.js";
import mainApp from "../app/main.js";
import medfomApp from "../app/medfom.js";
import miharuApp from "../app/miharu.js";
import sumwaveApp from "../app/sumwave.js";
import promisedLazyApp from "../app/promisedLazy.js";
import JyuPApp from "../app/jyup.js";

export function rootingSet(app: express.Express) {
    app.use((req, res, next) => {
        req.ip; req.headers["user-agent"];
        const domainRooting: { [domain: string]: ((req: express.Request, res: express.Response, next: express.NextFunction) => void) | undefined; } = {
            "kazunami36.com": mainApp,
            "medfom.com": medfomApp,
            "sumwave.net": sumwaveApp,
            "miharu.blog": miharuApp,
            "repezen.online": JyuPApp,
            "sumwave28536.com": sumwave28536App,
            "solfa.online": medfomApp,
            "192.168.*": mainApp
        }
        const domainName = (() => { for (const domainName of Object.keys(domainRooting)) if (req.hostname.match(domainName)) return domainName })();
        const date = new Date();
        const dateString = date.getUTCFullYear() + "/" + date.getUTCMonth() + "/" + date.getUTCDay() + " " + date.getUTCHours() + ":" + date.getUTCMinutes() + ":" + date.getUTCSeconds()
        if (!domainName) { console.log("[" + dateString, "] 不明なドメイン「" + req.hostname + "」を使ってのアクセス: " + req.ip + " URL: " + req.url); res.status(500); res.end(); return; };
        const access = domainRooting[domainName]
        if (!access) { console.log("[" + dateString, "] エラー「" + req.hostname + "」をうまく処理できませんでした。: " + req.ip + " URL: " + req.url); res.status(500); res.end(); return; };
        console.log("[" + dateString + "] アクセスされたドメイン: " + domainName + " URL: " + req.url + " IP: " + req.ip);
        access(req, res, next);
    });
}
export default rootingSet;
