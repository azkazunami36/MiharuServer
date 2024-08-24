addEventListener("load", async () => {

    function onClick(e: MouseEvent) {
        e.preventDefault();
        grecaptcha.enterprise.ready(async () => {
            const token = await grecaptcha.enterprise.execute('6LdzvRcqAAAAAGaOUXpEXNQdqKqO1EX-3onqhERP', { action: "Normal" });
            const data = (await new Promise(resolve => {
                const req = new XMLHttpRequest();
                req.open("POST", "http://sumwave28536.com/reCaptchaAPI");
                req.send(JSON.stringify({ token: token })); //データを送信
                req.onreadystatechange = async () => { if (req.readyState === 4 && req.status === 200) resolve(req.responseText) } //レスポンスを返す
            }))
            console.log(data);
        });
    };
    addEventListener("click", e => {
        onClick(e)
    })
    async function postTool(path: string, json: any) {
        return await new Promise(resolve => {
            const req = new XMLHttpRequest();
            req.open("POST", "http://" + window.location.hostname + path);
            req.send(JSON.stringify(json)); //データを送信
            req.onreadystatechange = async () => { if (req.readyState === 4 && req.status === 200) resolve(req.responseText) } //レスポンスを返す
        })
    }
    const data = await postTool("/userRequest/createAccounts", {
        nickname: "",
        mailAddress: "",
        mailCheckToken: "",
        password: ""
    })
})