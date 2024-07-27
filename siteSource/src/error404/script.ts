import { headerSetting } from "../js/headerSetting.js";

addEventListener("load", async () => {
    const viewport = document.createElement("meta");
    viewport.name = "viewport";
    viewport.content = "width=240,initial-scale=1.0";
    const stylesheet = document.createElement("link");
    stylesheet.rel = "stylesheet"
    stylesheet.href = "/src/css/homePageStype.css"
    const stylesheet2 = document.createElement("link");
    stylesheet2.rel = "stylesheet"
    stylesheet2.href = "/src/css/style.css"
    const stylesheet3 = document.createElement("link");
    stylesheet3.rel = "stylesheet"
    stylesheet3.href = "/src/error404/style.css"
    document.head.appendChild(viewport);
    document.head.appendChild(stylesheet);
    document.head.appendChild(stylesheet2);
    document.head.appendChild(stylesheet3);

    const mainHeader = document.createElement("div");
    mainHeader.id = "mainHeader"
    mainHeader.style.width = "fit-content";
    mainHeader.style.marginLeft = "auto";
    mainHeader.style.marginRight = "auto";
    const texts = document.createElement("div");
    texts.id = "texts";
    const h1 = document.createElement("h1");
    h1.innerText = "そのリンクわかんない～！";
    texts.appendChild(h1);
    const miharu = document.createElement("div");
    miharu.id = "miharu";
    const img = document.createElement("img");
    img.classList.add("e404");
    img.src = "/src/image/404.svg";
    const img2 = document.createElement("img");
    img2.classList.add("main");
    img2.src = "/src/image/泣いてるみはる.svg";
    miharu.appendChild(img);
    miharu.appendChild(img2);
    document.body.prepend(miharu);
    document.body.prepend(texts);
    document.body.prepend(mainHeader);

    headerSetting();
})