import { sumPageInit } from "./sumPageInit.js";

addEventListener("load", async () => {
    sumPageInit();

    (async function descriptionSetting() {
        const kazunamiDescription = await (await fetch("/mdToHTML", {
            method: "POST",
            headers: { "Content-Type": "text/plain" },
            body: await (await fetch("./src/kazunamiDescription.md")).text()
        })).text();

        const siteDescription = await (await fetch("/mdToHTML", {
            method: "POST",
            headers: { "Content-Type": "text/plain" },
            body: await (await fetch("./src/siteDescription.md")).text()
        })).text();

        const promisedLazyDescription = await (await fetch("/mdToHTML", {
            method: "POST",
            headers: { "Content-Type": "text/plain" },
            body: await (await fetch("./src/promisedLazyDescription.md")).text()
        })).text();

        const myProfile = document.getElementById("myProfile");
        const description = myProfile?.querySelector(".description");
        if (description) { description.innerHTML = kazunamiDescription; }
        const siteDescriptionElement = document.getElementById("siteDescription");
        const body = siteDescriptionElement?.querySelector(".body");
        if (body) { body.innerHTML = siteDescription; }
        const promisedLazy = document.getElementById("promisedLazy");
        const proDescription = promisedLazy?.querySelector(".description");
        if (proDescription) proDescription.innerHTML = promisedLazyDescription;
    })();

    (function clickURLSetting() {
        const promisedLazyDiscord = document.getElementById("promisedLazyDiscord") as HTMLAnchorElement;
        const promisedLazyWeb = document.getElementById("promisedLazyWeb") as HTMLAnchorElement;
        if (promisedLazyDiscord && promisedLazyWeb) {
            promisedLazyDiscord.href = "https://discord.gg/SdkRcYyCja";
            promisedLazyWeb.href = "/promisedLazy/";
        }
    })();
})