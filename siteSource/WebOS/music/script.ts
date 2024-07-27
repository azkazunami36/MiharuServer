import { headerSetting } from "../../src/js/headerSetting.js";

addEventListener("load", () => {
    headerSetting();
    new class sideBarResize {
        draging = false;
        position = 0;
        beforeSize = 0;
        style: CSSStyleDeclaration | undefined
        constructor() {
            const resizeSideBar = document.getElementById("resizeBar");
            const body = document.getElementById("body");
            body?.style.setProperty("--sidebarSize", "200px");
            resizeSideBar?.addEventListener("mousedown", e => {
                if (resizeSideBar && body) {
                    this.draging = true;
                    this.position = e.pageX;
                    this.style = body.style;
                    const data = this.style.getPropertyValue("--sidebarSize");
                    this.beforeSize = Number(data?.substring(0, data.length - 2));
                    e.preventDefault();
                }
            })
            addEventListener("mousemove", e => {
                if (this.draging) {
                    this.style?.setProperty("--sidebarSize", this.beforeSize + (e.pageX - this.position) + "px");
                    e.preventDefault();
                }
            })
            addEventListener("mouseup", e => {
                this.draging = false;
            })
        }
    }
})