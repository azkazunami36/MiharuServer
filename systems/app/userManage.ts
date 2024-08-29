import express from "express";
import fs from "fs";
import fsP from "fs/promises";
import { uuidv7 } from "uuidv7";

import sendMail from "../api/mailSendAPI.js";
import randomStringBuilder from "../modules/randomStringBuilder.js";

/** JSONパースを行います。エラー発生時は空のオブジェクトを返します。 */
function noErrorJSONParse(str: string) { try { return JSON.parse((str)) } catch (e) { return {} } };

async function fileExistCheck(path: string) { try { await fsP.stat(path); return true } catch (e) { return false } };

export class userManage {
    constructor() { }
    json: {
        users: {
            [id: string]: {
                nickname?: string;
                password?: string;
                mailAddress?: string;
                authority?: "normal" | "admin";
                token?: { loginToken?: { body?: string; issueTime?: number; }[]; };
            } | undefined;
        };
        mailCheck: { [mailAddress: string]: number | undefined; };
        mailToken: { [mailAddress: string]: ({ body?: string; issueTime?: number; }[] | undefined); };
        userSave: { [id: string]: true | undefined; };
        userIndex: { userID: string; mailAddress: string; }[];
    } = { users: {}, mailCheck: {}, mailToken: {}, userSave: {}, userIndex: [] };
    mailToken = new class mailToken {
        userManage: userManage;
        constructor(userManage: userManage) { this.userManage = userManage; };
        mailTokenCheck(mailAddress: string, mailToken: string) {
            const json = this.userManage.json;
            if (!json.mailToken[mailAddress]) return false;
            for (const data of json.mailToken[mailAddress]) if (mailToken === data.body) return true;
            return false;
        };
        /** 認証コードをメールアドレスに送信します。戻り値でtrueは成功、falseは失敗です。 */
        async mailTokenAuthCodeSend(mailAddress: string) {
            const json = this.userManage.json;
            const num = Number(randomStringBuilder(6, { num: true }));
            if (Number.isNaN(num)) return false;
            json.mailCheck[mailAddress] = num;
            const status = await sendMail("メール認証", mailAddress, "あなたの認証コードは" + json.mailCheck[mailAddress] + "です。現在メール送信用ページを用意していないため、臨時的なテキストメールでの送信となります。申し訳ありません。SumWave");
            if (status === 200) return true;
            return false;
        };
        mailTokenGet(mailAddress: string, code: number) {
            const json = this.userManage.json;
            if (json.mailCheck[mailAddress] !== code) return;
            if (!json.mailToken[mailAddress]) json.mailToken[mailAddress] = [];
            const body = randomStringBuilder(64, { str: true, num: true, upstr: true });
            const issueTime = Date.now();
            json.mailToken[mailAddress].push({ body, issueTime });
            return body;
        };
    }(this);
    loginToken = new class loginToken {
        userManage: userManage;
        constructor(userManage: userManage) { this.userManage = userManage; }
        /** 主に外部でアカウントの認証の際に使用する関数です。 */
        async loginTokenCheck(userID: string, loginToken: string) {
            const userData = await this.userManage.readUserJSON(userID);
            if (!userData?.token?.loginToken) return false;
            for (const data of userData.token.loginToken) if (loginToken === data.body) return true;
            return false;
        };
        async loginTokenGet(userID: string, mailAddress: string, mailCheckToken: string, password: string) {
            const userData = await this.userManage.readUserJSON(userID);
            if (!userData) return;
            if (!userData.token) userData.token = {};
            if (!userData.token.loginToken) userData.token.loginToken = [];
            if (!this.userManage.mailToken.mailTokenCheck(mailAddress, mailCheckToken)) return;
            if (userData.password !== password) return;
            const body = randomStringBuilder(64, { str: true, num: true, upstr: true });
            const issueTime = Date.now();
            userData.token.loginToken.push({ body, issueTime });
            await this.userManage.writeUserJSON(userID);
            return body;
        };
    }(this);
    userIndex = new class userIndex {
        userManage: userManage;
        constructor(userManage: userManage) { this.userManage = userManage; };
        async readJSON() {
            if (!await fileExistCheck("./systemDatas/userManage/userManage.json")) await this.writeJSON();
            try { this.userManage.json.userIndex = JSON.parse(String(await fsP.readFile("./systemDatas/userManage/userManage.json"))); } catch (e) { console.log(e) };
        }
        async writeJSON() { await fsP.writeFile("./systemDatas/userManage/userManage.json", JSON.stringify(this.userManage.json.userIndex)) };
        mailAddressExistCheck(string: string) {
            for (const index of this.userManage.json.userIndex) if (index.mailAddress === string) return true;
            return false;
        }
        userIDExistCheck(string: string) {
            for (const index of this.userManage.json.userIndex) if (index.userID === string) return true;
            return false;
        }
        idOrMailCheck(string: string) {
            for (const index of this.userManage.json.userIndex) {
                if (index.mailAddress === string) return "mailAddress";
                if (index.userID === string) return "userID";
            }
            return "unknown";
        }
        userIDtoMailConvert(string: string) {
            for (const index of this.userManage.json.userIndex) if (index.userID === string) return index.mailAddress;
        }
        mailToUserIDConvert(string: string) {
            for (const index of this.userManage.json.userIndex) if (index.mailAddress === string) return index.userID;
        }
    }(this)
    async userManage(req: express.Request, res: express.Response) {
        /** POSTを受けた際にどの内容の場合に何を実行するかを定義しています。 */
        const post: { [name: string]: (() => Promise<void | true | string>) | undefined } = {
            userIDConfirm: async () => {
                const json: { username?: string; } = noErrorJSONParse(req.body);
                if (!(json.username)) return "none username";
                let userID: string | undefined = json.username;
                const check = this.userIndex.idOrMailCheck(userID);
                if (check === "mailAddress") userID = this.userIndex.mailToUserIDConvert(userID);
                if (check === "unknown") userID = undefined;
                if (userID) {
                    res.statusCode = 200;
                    res.end(JSON.stringify({ userID: userID }));
                    return true;
                } else return "userID none";
            },
            userExistCheck: async () => {
                const json: { userID?: string; } = noErrorJSONParse(req.body);
                if (!(json.userID)) return;
                if (!await this.readUserJSON(json.userID)) return;
                res.statusCode = 200;
                res.end();
                return true;
            },
            mailUsedCheck: async () => {
                const json: { mailAddress?: string; } = noErrorJSONParse(req.body);
                if (!(json.mailAddress)) return;
                if (this.userIndex.mailAddressExistCheck(json.mailAddress)) {
                    res.statusCode = 200;
                    res.end();
                    return true;
                }
            },
            createAccounts: async () => {
                const json: { userID?: string; nickname?: string; mailAddress?: string; mailCheckToken?: string; password?: string; } = noErrorJSONParse(req.body);
                if (!(json.userID && json.mailAddress && json.mailCheckToken && json.nickname && json.password)) return "404";
                if (json.userID.replaceAll(/[0-9a-zA-Z._\-]/g, "") !== "" || json.userID.length <= 5 || json.userID.length >= 40 || json.password === "" || json.password.length <= 8) return "json invaid";
                if (await this.readUserJSON(json.userID)) return "sudenisonzai user";
                if (this.userIndex.mailAddressExistCheck(json.mailAddress)) return "sudenisiyou mailAddress";
                if (!this.mailToken.mailTokenCheck(json.mailAddress, json.mailCheckToken)) return "mailToken invaid";
                this.json.users[json.userID] = { nickname: json.nickname, password: json.password, mailAddress: json.mailAddress, authority: "normal" };
                this.json.userIndex.push({ userID: json.userID, mailAddress: json.mailAddress });
                await this.writeUserJSON(json.userID);
                await this.userIndex.writeJSON();
                res.statusCode = 200;
                res.end();
                return true;
            },
            mailTokenGet: async () => {
                const json: { mailAddress?: string; code?: string; userID?: string; } = noErrorJSONParse(req.body);
                if (!((json.mailAddress || json.userID) && json.code)) return;
                const mailAddress = json.mailAddress || (json.userID ? this.userIndex.userIDtoMailConvert(json.userID) : undefined);
                if (!mailAddress) return "mailAddress none";
                const token = this.mailToken.mailTokenGet(mailAddress, Number(json.code));
                if (!token) return "token none";
                res.statusCode = 200;
                res.end(JSON.stringify({ mailToken: token }));
                return true;
            },
            mailAuthCodeSend: async () => {
                const json: { mailAddress?: string; userID?: string; } = noErrorJSONParse(req.body);
                if (!(json.mailAddress || json.userID)) return;
                const mailAddress = json.mailAddress || (json.userID ? this.userIndex.userIDtoMailConvert(json.userID) : undefined);
                if (!mailAddress) return;
                const status = await this.mailToken.mailTokenAuthCodeSend(mailAddress);
                if (!status) return;
                res.statusCode = 200;
                res.end();
                return true;
            },
            loginTokenGet: async () => {
                const json: { userID?: string; mailAddress?: string; mailCheckToken?: string; password?: string; } = noErrorJSONParse(req.body);
                if (!((json.userID || json.mailAddress) && json.mailCheckToken && json.password)) return "json invaid";
                const userID = json.userID || (json.mailAddress ? this.userIndex.mailToUserIDConvert(json.mailAddress) : undefined);
                const mailAddress = json.mailAddress || (json.userID ? this.userIndex.userIDtoMailConvert(json.userID) : undefined);
                if (!(userID && mailAddress)) return;
                const token = await this.loginToken.loginTokenGet(userID, mailAddress, json.mailCheckToken, json.password);
                if (!token) return "token none";
                res.statusCode = 200;
                res.end(JSON.stringify({ loginToken: token }));
                return true;
            },
            login: async () => {
                const json: { userID?: string; loginToken?: string; } = noErrorJSONParse(req.body);
                if (!(json.userID && json.loginToken)) return;
                const boolean = await this.loginToken.loginTokenCheck(json.userID, json.loginToken);
                if (!boolean) return;
                res.statusCode = 200;
                res.end();
                return true;
            }
        }
        /** URLのルートパスを変更しています。(ニュアンス・説明が間違っていたらすみません。パスの一番左側を削除しています。) */
        const reqURL = (() => {
            const splitedURL = req.url.split("/");
            let text = "";
            for (let i = 2; i !== splitedURL.length; i++) text += (i !== 2 ? "/" : "") + splitedURL[i];
            return text
        })();
        const postFunction = post[reqURL];
        if (postFunction) {
            try {
                const status = await postFunction();
                if (status === undefined || typeof status === "string") {
                    console.log(reqURL, status);
                    res.writeHead(404);
                    res.end();
                }
            } catch (e) {
                console.log(e);
                res.writeHead(500);
                res.end();
            }
        } else {
            console.log(reqURL);
            res.writeHead(404);
            res.end();
        }
    }
    async readUserJSON(userID: string) {
        if (!this.json.users[userID]) {
            const path = "./systemDatas/userManage/usersJSON/" + userID + ".json";
            if (!await fileExistCheck(path)) return;
            try {
                const buf = await fsP.readFile(path);
                const json = noErrorJSONParse(String(buf));
                if (JSON.stringify(json) === "{}") return;
                this.json.users[userID] = json;
            } catch (e) { console.log(e); return; };
        }
        return this.json.users[userID];
    };
    async writeUserJSON(userID: string) {
        if (this.json.userSave[userID]) return;
        this.json.userSave[userID] = true;
        try {
            const path = "./systemDatas/userManage/usersJSON/" + userID + ".json";
            await fsP.writeFile(path, JSON.stringify(this.json.users[userID]));
        } catch (e) { console.log(e); };
        this.json.userSave[userID] = undefined;
    };
}

export default userManage;