import express from "express";

import { RecaptchaEnterpriseServiceClient } from "@google-cloud/recaptcha-enterprise";

export class reCaptchaAPI {
    async reCaptchaAPI(req: express.Request, res: express.Response) {
        if (!req.body) return res.writeHead(404).end();
        const json: { token?: string } | undefined = (() => { try { return JSON.parse(req.body) } catch (e) { return } })();
        if (!json) return res.writeHead(404).end();
        const checkRes = (json.token) ? String((await this.check(json.token, "Normal"))?.tokenProperties?.valid) : undefined;
        if (checkRes) res.writeHead(200).end(checkRes); else res.writeHead(404).end();
    }
    async check(token: string, recaptchaAction: string) {
        const response = await createAssessment({
            projectID: "sumwave28536-1721379069262",
            recaptchaKey: "6LdzvRcqAAAAAGaOUXpEXNQdqKqO1EX-3onqhERP",
            token: token,
            recaptchaAction
        });
        if (response && "tokenProperties" in response) return response;
    }
}

async function createAssessment({ projectID = "sumwave28536-1721379069262", recaptchaKey = "6LdzvRcqAAAAAGaOUXpEXNQdqKqO1EX-3onqhERP", token, recaptchaAction, }: {
    projectID: string;
    recaptchaKey: string;
    token?: string | undefined;
    recaptchaAction?: string | undefined;
}) {
    if (!(projectID && recaptchaKey && token && recaptchaAction)) return null
    const client = new RecaptchaEnterpriseServiceClient();

    const [response] = await client.createAssessment(({ assessment: { event: { token: token, siteKey: recaptchaKey } }, parent: client.projectPath(projectID) }));
    if (!response.tokenProperties?.valid) return new Error("トークンが次のため、CreateAssessment 呼び出しは失敗しました: " + response.tokenProperties?.invalidReason);
    if (response.tokenProperties.action !== recaptchaAction) return new Error("reCAPTCHA タグのアクション属性が、スコア付けを期待するアクションと一致しません。:" + response.tokenProperties.action)
    return response;
}