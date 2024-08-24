import { callbackify } from "util";
import { headerSetting } from "../../src/js/headerSetting.js";

headerSetting();

addEventListener("load", () => {
    new class imageView {
        mainElement: HTMLImageElement
        body: HTMLElement
        createImagePosition = 50;
        imageType = [
            "1232.jpg",
            "1233.jpg",
            "favicon.ico"
        ]
        imageTypeIsNo = 0;
        constructor() {
            this.body = document.body;
            this.mainElement = document.getElementById('ibuki') as HTMLImageElement
            const imageView = this;

            function keyProcess(keyName: string) {
                const singleKeyImageOperation: { key: string, func: "create" | "delete" | "shuffle" | "alignment" | "colorReverse" | "typeChange" }[] = [
                    { key: " ", func: "create" },
                    { key: "x", func: "delete" },
                    { key: "c", func: "shuffle" },
                    { key: "v", func: "alignment" },
                    { key: "g", func: "colorReverse" },
                    { key: "t", func: "typeChange" },
                ]
                function move(element: HTMLImageElement, target: "top" | "left", addOrsub: "add" | "sub") {
                    element.style[target] = String(addOrsub === "add" ? element.getBoundingClientRect()[target] + 5 : element.getBoundingClientRect()[target] - 5) + "px";
                }
                const keyTypeing: { keys: string[], func: () => void }[] = [
                    { keys: ["a", "ArrowLeft"], func: () => { move(imageView.mainElement, "left", "sub"); imageView.overflowCheck(imageView.mainElement); } },
                    { keys: ["w", "ArrowUp"], func: () => { move(imageView.mainElement, "top", "sub"); imageView.overflowCheck(imageView.mainElement); } },
                    { keys: ["d", "ArrowRight"], func: () => { move(imageView.mainElement, "left", "add"); imageView.overflowCheck(imageView.mainElement); } },
                    { keys: ["s", "ArrowDown"], func: () => { move(imageView.mainElement, "top", "add"); imageView.overflowCheck(imageView.mainElement); } },
                ]
                for (const data of singleKeyImageOperation) if (keyName === data.key) { imageView.imageOperation(data.func) }
                for (const data of keyTypeing) for (const key of data.keys) if (keyName === key) { data.func() }
            }

            const pressedKeys: {
                [keyName: string]: boolean
            } = {}
            let pressNo = 0;
            let interval: NodeJS.Timeout | undefined;

            addEventListener("keydown", e => {
                if (e.key === "h") return imageView.helpViewChange()
                if (!interval) interval = setInterval(() => {
                    for (let i = 0; i !== Object.keys(pressedKeys).length; i++)
                        if (pressedKeys[Object.keys(pressedKeys)[i]]) keyProcess(Object.keys(pressedKeys)[i]);
                }, 50)
                pressNo++;
                pressedKeys[e.key] = true;
            });
            addEventListener("keyup", e => {
                pressNo--;
                pressedKeys[e.key] = false;
                if (pressNo === 0) {
                    clearInterval(interval);
                    interval = undefined;
                }
            })
            addEventListener("resize", () => {
                const elements = document.getElementsByClassName("images") as HTMLCollectionOf<HTMLImageElement>; //オブジェクト取得
                for (const element of elements) this.overflowCheck(element);
            })
        }
        overflowCheck(element: HTMLImageElement) {
            const clientWidth = document.body.clientWidth;
            const clientHeight = document.body.clientHeight;
            const naturalWidth = element.naturalWidth;
            const naturalHeight = element.naturalHeight;
            const style = element.style;
            const data = element.getBoundingClientRect();
            if (Number(data.top) < 0) { style.top = "0" }
            if (Number(data.left) < 0) { style.left = "0" }
            if (Number(data.top) > (clientHeight - naturalHeight)) { style.top = String(clientHeight - naturalHeight) + "px" }
            if (Number(data.left) > (clientWidth - naturalWidth)) { style.left = String(clientWidth - naturalWidth) + "px" }
        }
        changeTablet() {
            /** 作成中 */
        }
        changePC() {
            /** 作成中 */
        }
        imageOperation(type: "create" | "delete" | "shuffle" | "alignment" | "colorReverse" | "typeChange") {
            switch (type) {
                case "create": {
                    const body = document.body;
                    const image = document.createElement("img");

                    image.src = this.imageType[this.imageTypeIsNo];
                    image.className = "images" //クラス指定
                    image.style.position = "absolute"; //スタイル指定
                    image.style.top = String(this.createImagePosition) + "px";
                    image.style.left = String(this.createImagePosition) + "px";

                    body.appendChild(image); //設置

                    const clientWidth = document.body.clientWidth;
                    const clientHeight = document.body.clientHeight;
                    const naturalWidth = image.naturalWidth;
                    const naturalHeight = image.naturalHeight;
                    if ((clientWidth < clientHeight) && (clientHeight - naturalHeight) < this.createImagePosition || (clientWidth - naturalWidth) < this.createImagePosition) this.createImagePosition = 0;

                    this.overflowCheck(image);

                    this.createImagePosition += 5; //newimageに5足す

                    break;
                }
                case "delete": {
                    const elements = document.getElementsByClassName("images") as HTMLCollectionOf<HTMLImageElement>;
                    if (elements.length <= 1) return;
                    elements[elements.length - 1].remove();
                    const clientWidth = document.body.clientWidth;
                    const clientHeight = document.body.clientHeight;
                    if (this.createImagePosition < 1) {
                        if (clientWidth < clientHeight) this.createImagePosition = clientHeight - elements[elements.length - 1].naturalHeight;
                        else this.createImagePosition = clientWidth - elements[elements.length - 1].naturalWidth;
                    } else this.createImagePosition -= 5;
                    break;
                }
                case "shuffle": {
                    const elements = document.getElementsByClassName("images") as HTMLCollectionOf<HTMLImageElement>;
                    const clientWidth = document.body.clientWidth;
                    const clientHeight = document.body.clientHeight;
                    for (const element of elements) {
                        element.style.left = Math.floor(Math.random() * (clientWidth - element.naturalWidth)) + "px";
                        element.style.top = Math.floor(Math.random() * (clientHeight - element.naturalHeight)) + "px";
                        this.overflowCheck(element);
                    };
                    break;
                }
                case "alignment": {
                    const elements = document.getElementsByClassName("images") as HTMLCollectionOf<HTMLImageElement>;
                    const clientWidth = document.body.clientWidth;
                    const clientHeight = document.body.clientHeight;
                    const topLeftPosition = { top: 0, left: 0 };
                    for (const element of elements) {
                        element.style.left = topLeftPosition.left + "px";
                        element.style.top = topLeftPosition.top + "px";
                        this.overflowCheck(element);
                        topLeftPosition.left += element.naturalWidth;
                        if (topLeftPosition.left > clientWidth) {
                            topLeftPosition.left = 0;
                            topLeftPosition.top += element.naturalHeight;
                            if (topLeftPosition.top > clientHeight) {
                                topLeftPosition.top = 0;
                            };
                        };
                    }; break;
                }
                case "colorReverse": {
                    const elements = document.getElementsByClassName("images") as HTMLCollectionOf<HTMLImageElement>;
                    for (const element of elements)
                        for (const classList of element.classList)
                            if (classList !== "reversal-color") element.classList.add("reversal-color");
                            else element.classList.remove("reversal-color");
                    const backgroundImage = document.getElementById("backimage") as HTMLImageElement;
                    for (const classList of backgroundImage.classList)
                        if (classList != "reversal-background-color") backgroundImage.classList.add("reversal-background-color");
                        else backgroundImage.classList.remove("reversal-background-color");
                    break;
                }
                case "typeChange": {
                    if (this.imageTypeIsNo === (this.imageType.length - 1)) this.imageTypeIsNo = 0;
                    else this.imageTypeIsNo++;
                    const ibuki = document.getElementById("ibuki") as HTMLImageElement;
                    const backimage = document.getElementById("backimage") as HTMLImageElement;
                    if (ibuki && backimage) {
                        ibuki.src = this.imageType[this.imageTypeIsNo];
                        backimage.src = this.imageType[this.imageTypeIsNo];
                    }
                }
            }
        }
        helpViewChange() {
            const help = document.getElementsByClassName("help-window")[0];
            !document.getElementsByClassName("helpd")[0] ? help.classList.add("helpd") : help.classList.remove("helpd");
        }
        mouseDrag = new (class drag {
            imageView: imageView
            constructor(imageView: imageView) {
                this.imageView = imageView
                this.mousePosition = { top: 0, left: 0 };
                addEventListener("mousedown", e => { if ((e.target as HTMLElement)?.classList.contains("images")) this.start(e) }, { passive: false }); //クリックされると
                addEventListener("touchstart", e => { this.start(e) }, { passive: false }); //タップされると
                addEventListener("mousemove", e => { this.move(e) });
                addEventListener("mouseup", e => { this.end(e) });
                addEventListener("touchmove", e => { this.move(e) });
                addEventListener("touchend", e => { this.end(e) });
            }
            moveingElements: HTMLImageElement | undefined;
            mousePosition = { top: 0, left: 0 };
            start(e: MouseEvent | TouchEvent) {
                if (!e.target) return;
                this.moveingElements = e.target as HTMLImageElement;
                const event = e.type === "mousedown" ? e : ((e as unknown) as TouchEvent).changedTouches[0];
                this.mousePosition.left = (event as MouseEvent).clientX - (event.target as HTMLElement).getBoundingClientRect().left;
                this.mousePosition.top = (event as MouseEvent).clientY - (event.target as HTMLElement).getBoundingClientRect().top;
            }
            move(e: MouseEvent | TouchEvent) {
                const element = this.moveingElements;
                if (element === undefined) return;
                e.preventDefault();
                const event = e.type === "mousemove" ? e : ((e as unknown) as TouchEvent).changedTouches[0];
                element.style.top = ((event as MouseEvent).clientY - this.mousePosition.top) + "px";
                element.style.left = ((event as MouseEvent).clientX - this.mousePosition.left) + "px";
                this.imageView.overflowCheck(element);
            }
            end(e: MouseEvent | TouchEvent) {
                if (this.moveingElements !== undefined) this.moveingElements = undefined;
            }
        })(this)
    }
});



var mouseX = 0, mouseY = 0
