import { sumPageInit } from "../src/js/sumPageInit.js";

addEventListener("load", async () => {
    sumPageInit();
    const mainSElement = document.getElementById("mainS");
    if (mainSElement) mainSElement.innerHTML = await (await fetch("/mdToHTML", {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: await (await fetch("./texts/main.md")).text()
    })).text();
    const subSElement = document.getElementById("subS");
    if (subSElement) subSElement.innerHTML = await (await fetch("/mdToHTML", {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: await (await fetch("./texts/sub.md")).text()
    })).text();
    const sub2SElement = document.getElementById("sub2S");
    if (sub2SElement) sub2SElement.innerHTML = await (await fetch("/mdToHTML", {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: await (await fetch("./texts/sub2.md")).text()
    })).text();
})