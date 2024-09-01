import MailComposer from "nodemailer/lib/mail-composer/index.js";
import path from "path";
import { google } from "googleapis";
import fs from "fs";
import { OAuth2Client } from "google-auth-library";
import http from "http";
import url from "url";
import destroyer from "server-destroy";
export async function sendMail(
    /** 題名 */subject: string,
    /** 送り先 */to: string,
    /** 内容 */text: string,
    /** 自身の名前 */name?: string
) {
    try {
        const keys = JSON.parse(String(fs.readFileSync(path.join(process.cwd(), "./keyData/credentials.json"))));
        const tokenPath = path.join(process.cwd(), "./keyData/token.json");
        const oAuth2Client = new OAuth2Client(keys.installed.client_id, keys.installed.client_secret, "http://localhost:3000");
        if (!fs.existsSync(tokenPath)) await new Promise<void>((resolve, reject) => {
            const server = http.createServer(async (req, res) => {
                try {
                    if (req.url) {
                        const qs = new url.URL(req.url, "http://localhost:3000").searchParams;
                        const code = qs.get("code");
                        console.log(`Code is ${code}`);
                        res.end("Authentication successful! Please return to the console.");
                        server.destroy();
                        fs.writeFileSync(tokenPath, JSON.stringify((await oAuth2Client.getToken(code || "0")).tokens));
                        resolve();
                    }
                } catch (e) { console.log(e, "servererr"); reject(); }
            }).listen(3000).on("listening", async () => {
                console.log("認証が必要です。次のリンクを開いてください。ローカルホストにリダイレクトするため、実行マシンで開いてください。", oAuth2Client.generateAuthUrl({ access_type: "offline", scope: ["https://www.googleapis.com/auth/gmail.send"] }));
            }); destroyer(server);
        });
        oAuth2Client.setCredentials((() => {
            try {
                return JSON.parse(String(fs.readFileSync(tokenPath)))
            } catch (e) {
                return undefined
            }
        })() || {});
        try {
            return (await google.gmail({
                version: "v1",
                auth: oAuth2Client
            }).users.messages.send({
                userId: "me",
                requestBody: {
                    raw: Buffer.from(await new MailComposer({
                        from: (name || "Sum Wave") + "<sumwave28536@gmail.com>", to, text, subject, textEncoding: "base64"
                    }).compile().build()).toString("base64").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
                }
            })).status
        } catch (e) {
            console.log(e, "senderr")
        }
    } catch (e) { console.log(e) }
} export default sendMail;