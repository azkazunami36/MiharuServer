import { headerSetting } from "./headerSetting.js";
import { getRuleBySelector } from "./getRuleBySelector.js";
import { resizeEventSetting } from "./resizeEventSetting.js";

export function sumPageInit() {
    const mainHeader = document.getElementById("mainHeader");
    const mainContents = document.getElementById("mainContents") || document.createElement("div");
    const scrollPushBottom = document.getElementById("scrollPushBottom");
    if (mainContents && mainHeader) {
        mainHeader.remove();
        mainContents.remove();
        mainContents.id = "mainContents";
        mainContents.classList.add("mainContents");

        const background = document.createElement("div");
        const mainScroll = document.createElement("div");
        background.id = "background"
        mainScroll.id = "mainScroll"
        mainScroll.appendChild(mainHeader);
        mainScroll.appendChild(mainContents);

        if (scrollPushBottom) {
            for (const node of scrollPushBottom.children) mainScroll.appendChild(node);
            scrollPushBottom.remove();
        };
        
        document.body.appendChild(background);
        document.body.appendChild(mainScroll);

        headerSetting();
        function resizeEvent() {
            const { lessThan } = new resizeEventSetting();
            const mainContent = getRuleBySelector("#mainContents");
            if (mainContent) { }
        }
        resizeEvent();
        window.addEventListener("resize", resizeEvent);
    }
}