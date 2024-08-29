import cookieValueGet from "../src/js/cookieValueGet.js";
import postTool from "../src/js/postTool.js";
import { sumPageInit } from "../src/js/sumPageInit.js";

addEventListener("load", () => {
    sumPageInit();
    if (cookieValueGet("token") && cookieValueGet("id")) window.location.href = "/accountManage/";

    const loginWindow = document.getElementById("loginWindow");

    const username = document.getElementById("username") as HTMLInputElement | null;
    const password = document.getElementById("password") as HTMLInputElement | null;
    if (!(username && password)) return;

    const emptyusername = document.getElementById("emptyusername") as HTMLDivElement | null;
    const emptypassword = document.getElementById("emptypassword") as HTMLDivElement | null;
    const notmatchingpassword = document.getElementById("notmatchingpassword") as HTMLDivElement | null;
    if (!(emptyusername && emptypassword && notmatchingpassword)) return;

    const authCodeWindow = document.getElementById("authCodeWindow") as HTMLDivElement | null;

    const authCode = document.getElementById("authCode") as HTMLInputElement | null;

    const notmatchcode = document.getElementById("notmatchcode") as HTMLDivElement | null;

    if (!(authCode && notmatchcode)) return;

    if (!(loginWindow && authCodeWindow)) return;

    const submit = document.getElementById("submit") as HTMLButtonElement | null;
    const authsubmit = document.getElementById("authsubmit") as HTMLButtonElement | null;

    if (!(submit && authsubmit)) return;

    submit.addEventListener("click", async e => {
        e.preventDefault();
        const emptynicknameIs = username.value === "";
        const emptypasswordIs = password.value === "";
        const notmatchingpasswordIs = false;
        emptyusername.style.display = emptynicknameIs ? "block" : "none";
        emptypassword.style.display = emptypasswordIs ? "block" : "none";
        notmatchingpassword.style.display = (!emptypasswordIs && notmatchingpasswordIs) ? "block" : "none";
        if (emptynicknameIs
            || emptypasswordIs
            || notmatchingpasswordIs
        ) return;
        try {
            const userID = JSON.parse(String(await postTool("/userRequest/userIDConfirm", { username: username.value }))).userID;
            await postTool("/userRequest/mailAuthCodeSend", { mailAddress: username.addEventListener, userID });
            loginWindow.style.display = "none";
            authCodeWindow.style.display = "block";
            authsubmit.addEventListener("click", async e => {
                e.preventDefault();
                    notmatchcode.style.display = "none";
                try {
                    if (typeof userID !== "string") throw "不明なエラー";
                    const mailToken = JSON.parse(String(await postTool("/userRequest/mailTokenGet", { userID, code: authCode.value }))).mailToken;
                    const loginToken = JSON.parse(String(await postTool("/userRequest/loginTokenGet", { userID: userID, mailCheckToken: mailToken, password: password.value }))).loginToken;
                    document.cookie = "token=" + loginToken + ";maxage=" + (60 * 60 * 24 * 180);
                    document.cookie = "id=" + userID + ";maxage=" + (60 * 60 * 24 * 180);
                } catch (e) {
                    console.log(e);
                    notmatchcode.style.display = "block";
                }
            });
        } catch (e) { };
    });
});