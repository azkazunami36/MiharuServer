import { sumPageInit } from "../js/sumPageInit.js";

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
    const title = document.createElement("title");
    title.innerText = "みはるわかんない！";
    document.head.appendChild(viewport);
    document.head.appendChild(stylesheet);
    document.head.appendChild(stylesheet2);
    document.head.appendChild(stylesheet3);
    document.head.appendChild(title);

    const mainHeader = document.createElement("div");
    mainHeader.id = "mainHeader"
    mainHeader.style.width = "fit-content";
    mainHeader.style.marginLeft = "auto";
    mainHeader.style.marginRight = "auto";
    const mainContents = document.createElement("div");
    const texts1 = document.createElement("div");
    const h1 = document.createElement("h1");
    const miharu = document.createElement("div");
    const img = document.createElement("img");
    const img2 = document.createElement("img");
    const texts2 = document.createElement("div");
    const p1 = document.createElement("p");
    const p2 = document.createElement("p");

    mainContents.id = "mainContents";
    texts1.id = "texts";
    h1.innerText = "そのリンクわかんない～！";
    miharu.id = "miharu";
    img.classList.add("e404");
    img.src = "/src/image/404.svg";
    img2.classList.add("main");
    img2.src = "/src/image/泣いてるみはる.svg";
    texts2.id = "texts";
    p1.innerText = document.body.innerText;
    p2.innerText = "「ホーム」をクリックすることで、このサイトの様々な場所へアクセスすることができます。今一度ご覧ください。";

    texts1.appendChild(h1);
    miharu.appendChild(img);
    miharu.appendChild(img2);
    texts2.appendChild(p1);
    texts2.appendChild(p2);
    mainContents.appendChild(texts1);
    mainContents.appendChild(miharu);
    mainContents.appendChild(texts2);
    document.body.innerText = "";
    document.body.appendChild(mainHeader);
    document.body.appendChild(mainContents);

    sumPageInit();
})