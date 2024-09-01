import cookieValueGet from "../src/js/cookieValueGet.js";
import postTool from "../src/js/postTool.js";
import { sumPageInit } from "../src/js/sumPageInit.js";

addEventListener("load", () => {
    sumPageInit();

    if (cookieValueGet("token") && cookieValueGet("id")) window.location.href = "/accountManage/";
    const createAccountWindow = document.getElementById("createAccountWindow");

    const id = document.getElementById("id") as HTMLInputElement | null;
    const nickname = document.getElementById("nickname") as HTMLInputElement | null;
    const mailAddress = document.getElementById("mailAddress") as HTMLInputElement | null;
    const password = document.getElementById("password") as HTMLInputElement | null;
    const repassword = document.getElementById("repassword") as HTMLInputElement | null;
    if (!(id && nickname && mailAddress && password && repassword)) return;

    const emptynickname = document.getElementById("emptynickname") as HTMLDivElement | null;
    const emptymailaddress = document.getElementById("emptymailaddress") as HTMLDivElement | null;
    const usedmailaddress = document.getElementById("usedmailaddress") as HTMLDivElement | null;
    const emptyid = document.getElementById("emptyid") as HTMLDivElement | null;
    const duplicid = document.getElementById("duplicid") as HTMLDivElement | null;
    const incorrectid = document.getElementById("incorrectid") as HTMLDivElement | null;
    const shortageid = document.getElementById("shortageid") as HTMLDivElement | null;
    const toolongid = document.getElementById("toolongid") as HTMLDivElement | null;
    const emptypassword = document.getElementById("emptypassword") as HTMLDivElement | null;
    const notmatchingpassword = document.getElementById("notmatchingpassword") as HTMLDivElement | null;
    const shortagepassword = document.getElementById("shortagepassword") as HTMLDivElement | null;
    if (!(emptynickname && emptymailaddress && usedmailaddress && emptyid && duplicid && incorrectid && shortageid && toolongid && emptypassword && notmatchingpassword && shortagepassword)) return;

    const authCodeWindow = document.getElementById("authCodeWindow") as HTMLDivElement | null;

    const authCode = document.getElementById("authCode") as HTMLInputElement | null;

    const notmatchcode = document.getElementById("notmatchcode") as HTMLDivElement | null;

    if (!(authCode && notmatchcode)) return;

    if (!(createAccountWindow && authCodeWindow)) return;

    const submit = document.getElementById("submit") as HTMLButtonElement | null;
    const authsubmit = document.getElementById("authsubmit") as HTMLButtonElement | null;
    if (!(submit && authsubmit)) return;

    let createData: {
        userID?: string;
        nickname?: string;
        mailAddress?: string;
        mailCheckToken?: string;
        password?: string;
    } = {};

    submit.addEventListener("click", async e => {
        e.preventDefault();
        const emptynicknameIs = nickname.value === "";
        const emptymailaddressIs = mailAddress.value === "";
        const usedmailaddressIs = false;
        const emptyidIs = id.value === "";
        const duplicidIs = false;
        const incorrectidIs = id.value.replaceAll(/[0-9a-zA-Z._\-]/g, "") !== "";
        const shortageidIs = id.value.length <= 5;
        const toolongidIs = id.value.length >= 40;
        const emptypasswordIs = password.value === "";
        const notmatchingpasswordIs = password.value !== repassword.value;
        const shortagepasswordIs = password.value.length <= 8;
        emptynickname.style.display = emptynicknameIs ? "block" : "none";
        emptymailaddress.style.display = emptymailaddressIs ? "block" : "none";
        emptyid.style.display = emptyidIs ? "block" : "none";
        emptypassword.style.display = emptypasswordIs ? "block" : "none";
        usedmailaddress.style.display = usedmailaddressIs ? "block" : "none";
        duplicid.style.display = duplicidIs ? "block" : "none";
        incorrectid.style.display = incorrectidIs ? "block" : "none";
        shortageid.style.display = (!emptyidIs && shortageidIs) ? "block" : "none";
        toolongid.style.display = toolongidIs ? "block" : "none";
        notmatchingpassword.style.display = (!emptypasswordIs && notmatchingpasswordIs) ? "block" : "none";
        shortagepassword.style.display = (!emptypasswordIs && shortagepasswordIs) ? "block" : "none";
        if (emptynicknameIs
            || emptymailaddressIs
            || usedmailaddressIs
            || emptyidIs
            || duplicidIs
            || incorrectidIs
            || shortageidIs
            || toolongidIs
            || emptypasswordIs
            || notmatchingpasswordIs
            || shortagepasswordIs
        ) return;
        createData = {
            userID: id.value,
            nickname: nickname.value,
            mailAddress: mailAddress.value,
            mailCheckToken: undefined,
            password: password.value
        }
        try {
            await postTool("/userRequest/mailAuthCodeSend", { mailAddress: createData.mailAddress, userID: createData.userID });
            createAccountWindow.style.display = "none";
            authCodeWindow.style.display = "block";
            authsubmit.addEventListener("click", async e => {
                e.preventDefault();
                try {
                    notmatchcode.style.display = "none";
                    createData.mailCheckToken = JSON.parse(String(await postTool("/userRequest/mailTokenGet", { mailAddress: createData.mailAddress, code: authCode.value }))).mailToken;;
                    await postTool("/userRequest/createAccounts", createData);
                    const loginToken = JSON.parse(String(await postTool("/userRequest/loginTokenGet", createData))).loginToken;
                    document.cookie = "token=" + loginToken + ";maxage=" + (60 * 60 * 24 * 180) + "; path=/";
                    document.cookie = "id=" + createData.userID + ";maxage=" + (60 * 60 * 24 * 180) + "; path=/";
                    window.location.href = "/accountManage/";
                } catch (e) {
                    console.log(e);
                    notmatchcode.style.display = "block";
                }
                authCode.value;
            })
        } catch (e) {

        }
    })
})