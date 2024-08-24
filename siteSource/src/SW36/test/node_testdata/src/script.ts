addEventListener("load", () => { //かずなみ定義集[]配列 {}ブロック
    const imagemove = new class imagemove {
        imgselement: HTMLElement | null;
        imgsAnimation: HTMLElement | null;
        imgs = ["summerscrim.png", "logo.png"];
        /** 何枚目の画像が選ばられているか。0から始まる。 */
        viewImageNo = 0;
        constructor() {
            this.imgselement = document.getElementById("imgs");
            this.imgsAnimation = document.getElementById("imgsAnimation");
            if (this.imgselement) {
                this.imgselement.style.left = "0px";
                for (const img of this.imgs) {
                    const imgelement = document.createElement("img");

                    imgelement.classList.add("imgelement");
                    imgelement.src = "./src/image/" + img;

                    this.imgselement.appendChild(imgelement);
                }
            }
        }
        imagemove() {
            if (this.imgsAnimation) {
                const imagemove = -(document.body.clientWidth * this.viewImageNo);
                this.imgsAnimation.style.left = String(imagemove + "px");
                
            }
        }
    }
})