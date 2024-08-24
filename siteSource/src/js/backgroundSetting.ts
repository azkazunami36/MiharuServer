export function backgroundSetting() {
    const backgroudElement = document.getElementById("background");
    const img = document.createElement("img");
    img.src = "/src/image/background-black.svg";
    backgroudElement?.appendChild(img);
}