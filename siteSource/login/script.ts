import postTool from "../src/js/postTool.js";
import { sumPageInit } from "../src/js/sumPageInit.js";

addEventListener("load", () => {
    sumPageInit();

    const loginWindow = document.getElementById("loginWindow");

    const username = document.getElementById("username") as HTMLInputElement | null;
    const password = document.getElementById("password") as HTMLInputElement | null;;
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

    submit.addEventListener("click", async () => {
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
            await postTool("/userRequest/mailAuthCodeSend", { mailAddress: username.addEventListener, userID: createData.userID });
            loginWindow.style.display = "none";
            authCodeWindow.style.display = "block";
            authsubmit.addEventListener("click", async e => {
                e.preventDefault();
                try {
                    console.log("authsubmit送信")
                    notmatchcode.style.display = "none";
                    console.log("mailTokenGet")
                    const mailToken = JSON.parse(String(await postTool("/userRequest/mailTokenGet", { mailAddress: createData.mailAddress, code: authCode.value }))).mailToken;
                    console.log("mailToken: " + mailToken);
                    createData.mailCheckToken = mailToken;
                    console.log("createAccount")
                    await postTool("/userRequest/createAccounts", createData);
                    console.log("ok. loginTokenGet")
                    const loginToken = JSON.parse(String(await postTool("/userRequest/loginTokenGet", createData))).loginToken;
                    console.log("loginToken: " + loginToken);
                } catch (e) {
                    console.log(e);
                    notmatchcode.style.display = "block";
                }
                authCode.value;
            })
    });
})