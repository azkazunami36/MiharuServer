import e from "express";
import { getRuleBySelector } from "./getRuleBySelector.js";
import { resizeEventSetting } from "./resizeEventSetting.js";

export function headerSetting() {
    const mainHeader = document.getElementById("mainHeader");
    if (mainHeader) {
        mainHeader.style.width = "";
        mainHeader.style.marginLeft = "";
        mainHeader.style.marginRight = "";
        const bodyHeader = document.createElement("div");
        bodyHeader.classList.add("bodyHeader");
        function shadow() {
            if (window.scrollY <= 0)
                bodyHeader?.classList.add("above");
            else
                bodyHeader?.classList.remove("above");
        }
        shadow();
        addEventListener("scroll", shadow);

        function propSetting(tools: { name?: string, url?: string, imageUrl?: string, script?: (elements: { tr: HTMLTableRowElement, td: HTMLTableCellElement, a: HTMLAnchorElement }) => void }[], tr: HTMLTableRowElement) {
            for (const func of tools) {
                const td = document.createElement("td");
                const a = document.createElement("a");
                const url = func.url;
                if (url) {
                    if (window.location.pathname === url || (url !== "/" && window.location.pathname.match(url + "*"))) {
                        if (window.location.pathname !== url) a.href = url;
                        td.classList.add("selected");
                    } else a.href = url;
                }
                const imageUrl = func.imageUrl;
                if (imageUrl) {
                    const img = document.createElement("img");
                    img.src = imageUrl;
                    a.appendChild(img);
                }
                const name = func.name;
                if (name) {
                    const titleDiv = document.createElement("div");
                    titleDiv.innerText = name;
                    a.appendChild(titleDiv);
                }
                td.appendChild(a);
                tr.appendChild(td);
                if (func.script) func.script({ tr: tr, td: td, a: a });
            }
        }

        const pageItemTable = document.createElement("table");
        pageItemTable.id = "pageItem";
        const pageItemTbody = document.createElement("tbody");
        const pageItemTr = document.createElement("tr");

        const title = document.createElement("td");
        title.classList.add("title");
        title.innerText = "メニュー";
        pageItemTr.appendChild(title);
        propSetting([
            { name: "ホーム", url: "/" },
            { name: "ゲーム・遊び", url: "/games/" },
            { name: "Web OS/App", url: "/WebOS/" },
            { name: "小説・漫画", url: "/novel/" },
            { name: "掲示板", url: "/bulletinBoard/" },
            { name: "Promised Lazy", url: "/promisedLazy/" },
            { name: "寄付・支援", url: "/donate/" },
            { name: "依頼・リクエスト", url: "/request/" },
            { name: "Webページ制作中です。" },
            { name: "ログイン", url: "/login/", imageUrl: "f" }
        ], pageItemTr);
        pageItemTbody.appendChild(pageItemTr);
        pageItemTable.appendChild(pageItemTbody);
        bodyHeader.appendChild(pageItemTable);

        const normalHeaderToolsTable = document.createElement("table");
        normalHeaderToolsTable.id = "normalHeaderTools";
        const normalHeaderToolsTbody = document.createElement("tbody");
        const normalHeaderToolsTr = document.createElement("tr");

        propSetting([
            {
                imageUrl: "/src/image/メニューアイコン黒.svg", script: elements => {
                    let timeout: NodeJS.Timeout | undefined;
                    let listenerIs = false;
                    function eventListener (e: any) {
                        
                    }
                    function click(e?: MouseEvent | TouchEvent) {
                        e?.preventDefault();
                        if (pageItemTable.classList.contains("viewed")) {
                            pageItemTable.classList.remove("viewed");
                            timeout = setTimeout(() => {
                                pageItemTable.style.display = "none";
                            }, 200);
                        } else {
                            if (timeout) clearTimeout(timeout);
                            pageItemTable.style.display = "";
                            setTimeout(() => { pageItemTable.classList.add("viewed"); }, 1);
                        };
                    }
                    elements.td.addEventListener("mouseup", click);
                    elements.td.addEventListener("touchend", click);
                    window.addEventListener("resize", () => {
                        if (window.innerWidth > 700) {
                            if (pageItemTable.style.display === "none") pageItemTable.style.display = "";
                            if (pageItemTable.classList.contains("viewed")) {
                                click();
                                if (timeout) clearTimeout(timeout);
                            }
                            if (!listenerIs) {
                                listenerIs = true;
                                document.addEventListener("mousedown", eventListener);
                            }
                        } else {
                            if (listenerIs) {
                                listenerIs = false;
                                document.removeEventListener("mousedown", eventListener);
                            }
                            if (!pageItemTable.classList.contains("viewed") && pageItemTable.style.display === "") pageItemTable.style.display = "none";
                        }
                    })
                }
            }
        ], normalHeaderToolsTr);

        normalHeaderToolsTbody.appendChild(normalHeaderToolsTr);
        normalHeaderToolsTable.appendChild(normalHeaderToolsTbody);
        bodyHeader.appendChild(normalHeaderToolsTable);

        mainHeader.appendChild(bodyHeader);
        if (!(window.innerWidth > 700)) pageItemTable.style.display = "none";
    }
    function resizeEvent() {
        const { lessThan } = new resizeEventSetting();

        const header = document.getElementById("header");
        const viewBody = header?.querySelector(".viewBody");
        const elements = viewBody?.querySelector(".elements") as HTMLElement;
        if (elements) {
            if (lessThan) {
                elements.classList.add("boxed");
                elements.style.height = "auto";
                elements.style.right = "0";
            } else {
                elements.classList.remove("boxed");
                elements.style.height = "50px";
                elements.style.right = "";
            };
        };
    };
    resizeEvent();
    window.addEventListener("resize", resizeEvent);
};