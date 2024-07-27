import express from "express";
import fs from "fs";

import { RecaptchaEnterpriseServiceClient } from "@google-cloud/recaptcha-enterprise/build/src/index.js";

export class reCaptchaAPI {
    constructor() { }
    async reCaptchaAPI(req: express.Request, res: express.Response) {
        if (!req.body) return res.writeHead(404).end();
        const json: { token: string } | undefined = (() => { try { return JSON.parse(req.body) } catch (e) { return } })();
        if (!json) return res.writeHead(404).end();
        const recaptchaAction = "Normal";
        const score = await createAssessment({
            projectID: "sumwave28536-1721379069262",
            recaptchaKey: "6LdzvRcqAAAAAGaOUXpEXNQdqKqO1EX-3onqhERP",
            token: json.token,
            recaptchaAction
        });

        res.writeHead(200);
        res.end(String(score));
    }
}

/**
  * 評価を作成して UI アクションのリスクを分析する。
  *
  * projectID: Google Cloud プロジェクト ID
  * recaptchaSiteKey: サイト / アプリに関連付けられた reCAPTCHA キー
  * token: クライアントから取得した生成トークン。
  * recaptchaAction: トークンに対応するアクション名。
  */
async function createAssessment({
    projectID = "sumwave28536-1721379069262",
    recaptchaKey = "6LdzvRcqAAAAAGaOUXpEXNQdqKqO1EX-3onqhERP",
    token,
    recaptchaAction,
}: {
    projectID?: string | undefined;
    recaptchaKey?: string | undefined;
    token?: string | undefined;
    recaptchaAction?: string | undefined;
}) {
    // reCAPTCHA クライアントを作成する。
    // TODO: クライアント生成コードをキャッシュに保存するか（推奨）、メソッドを終了する前に client.close() を呼び出す。
    if (!(projectID && recaptchaKey && token && recaptchaAction)) return null
    const client = new RecaptchaEnterpriseServiceClient();
    const projectPath = client.projectPath(projectID);

    // 評価リクエストを作成する。
    const request = ({
        assessment: {
            event: {
                token: token,
                siteKey: recaptchaKey,
            },
        },
        parent: projectPath,
    });

    const [response] = await client.createAssessment(request);

    // トークンが有効かどうかを確認する。
    if (!response.tokenProperties?.valid) {
        console.log("トークンが次のため、CreateAssessment 呼び出しは失敗しました: " + response.tokenProperties?.invalidReason);
        return null;
    }

    // 想定どおりのアクションが実行されたかどうかを確認する。
    // The `action` property is set by user client in the grecaptcha.enterprise.execute() method.
    if (response.tokenProperties.action === recaptchaAction) {
        // リスクスコアと理由を取得する。
        // 評価の解釈の詳細については、以下を参照:
        // https://cloud.google.com/recaptcha-enterprise/docs/interpret-assessment
        console.log("reCaptchaのスコアは次の通りです: " + response.riskAnalysis?.score);
        response.riskAnalysis?.reasons?.forEach((reason) => {
            console.log(reason);
        });

        return response.riskAnalysis?.score;
    } else {
        console.log("reCAPTCHA タグのアクション属性が、スコア付けを期待するアクションと一致しません。:" + response.tokenProperties.action);
        return null;
    }
}