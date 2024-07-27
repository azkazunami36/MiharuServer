export class resizeEventSetting {
    static threshold = 800;
    get lessThan() { return document.body.clientWidth < resizeEventSetting.threshold };
}