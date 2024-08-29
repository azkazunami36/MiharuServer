export function cookieValueGet(key: string) {
    return document.cookie.split("; ").find((row) => row.startsWith(key + "="))?.split("=")[1];
}

export default cookieValueGet;