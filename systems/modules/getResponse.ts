import fs from "fs";
import fsP from "fs/promises";
import path from "path";
import http from "http";
import express from "express";
import multer from "multer";
import bodyParser from "body-parser";

export class GetResponse {
    constructor() { }
    errorHtmlPath: { [error: number]: string } = {
        404: ""
    }
    urlGet(url: string) {
        const parsedURL = decodeURIComponent(url);
        const splitedURL = parsedURL.split("?")[0];
        return splitedURL[splitedURL.length - 1] !== "/" ? splitedURL : splitedURL + "index.html";
    }
    async headerGet(req: express.Request, filepath: string, fileSize: number): Promise<http.OutgoingHttpHeaders | http.OutgoingHttpHeader[]> {
        const headers: http.OutgoingHttpHeaders | http.OutgoingHttpHeader[] = { "Accept-Ranges": "bytes" };
        const data = [
            ["aac", "audio/aac"],
            ["abw", "application/x-abiword"],
            ["arc", "application/x-freearc"],
            ["avi", "video/x-msvideo"],
            ["azw", "application/vnd.amazon.ebook"],
            ["bin", "application/octet-stream"],
            ["bmp", "image/bmp"],
            ["bz", "application/x-bzip"],
            ["bz2", "application/x-bzip2"],
            ["csh", "application/x-csh"],
            ["css", "text/css"],
            ["csv", "text/csv"],
            ["doc", "application/msword"],
            ["docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
            ["eot", "application/vnd.ms-fontobject"],
            ["epub", "application/epub+zip"],
            ["gz", "application/gzip"],
            ["gif", "image/gif"],
            ["htm", "text/html"],
            ["html", "text/html"],
            ["ico", "image/vnd.microsoft.icon"],
            ["ics", "text/calendar"],
            ["jar", "application/java-archive"],
            ["jpeg", "image/jpeg"],
            ["jpg", "image/jpeg"],
            ["js", "text/javascript"],
            ["json", "application/json"],
            ["jsonld", "application/ld+json"],
            ["mid", "audio/midi audio/x-midi"],
            ["midi", "audio/midi audio/x-midi"],
            ["mjs", "text/javascript"],
            ["mkv", "video/x-matroska"],
            ["mp3", "audio/mpeg"],
            ["mp4", "video/mp4"],
            ["mpeg", "video/mpeg"],
            ["mpkg", "application/vnd.apple.installer+xml"],
            ["odp", "application/vnd.oasis.opendocument.presentation"],
            ["ods", "application/vnd.oasis.opendocument.spreadsheet"],
            ["odt", "application/vnd.oasis.opendocument.text"],
            ["oga", "audio/ogg"],
            ["ogv", "video/ogg"],
            ["ogx", "application/ogg"],
            ["opus", "audio/opus"],
            ["otf", "font/otf"],
            ["png", "image/png"],
            ["pdf", "application/pdf"],
            ["php", "application/x-httpd-php"],
            ["ppt", "application/vnd.ms-powerpoint"],
            ["pptx", "application/vnd.openxmlformats-officedocument.presentationml.presentation"],
            ["rar", "application/vnd.rar"],
            ["rtf", "application/rtf"],
            ["sh", "application/x-sh"],
            ["svg", "image/svg+xml"],
            ["swf", "application/x-shockwave-flash"],
            ["tar", "application/x-tar"],
            ["tif", "image/tiff"],
            ["tiff", "image/tiff"],
            ["ts", "video/mp2t"],
            ["ttf", "font/ttf"],
            ["txt", "text/plain"],
            ["vsd", "application/vnd.visio"],
            ["wav", "audio/wav"],
            ["weba", "audio/webm"],
            ["webm", "video/webm"],
            ["webp", "image/webp"],
            ["woff", "font/woff"],
            ["woff2", "font/woff2"],
            ["xhtml", "application/xhtml+xml"],
            ["xls", "application/vnd.ms-excel"],
            ["xlsx", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
            ["xml", "application/xml"],
            ["xul", "application/vnd.mozilla.xul+xml"],
            ["zip", "application/zip"],
            ["3gp", "video/3gpp"],
            ["3g2", "video/3gpp2"],
            ["7z", "application/x-7z-compressed"],
        ];

        function contentTypeToExtConvert(/** @type {string} */string: string, /** @type {"extension" | "contentType"} */toType: "extension" | "contentType") {
            for (let i = 0; i !== data.length; i++) {
                if (data[i][toType === "contentType" ? 0 : 1] === string) return data[i][toType === "extension" ? 0 : 1];
            }
        }
        const contentType = contentTypeToExtConvert(path.extname(filepath).replace(".", ""), "contentType");
        if (contentType) headers["Content-Type"] = contentType;
        const ranges = await this.rangesGet(req, fileSize);
        if (!req.headers.range) ranges.end = fileSize !== 0 ? fileSize - 1 : 0;
        headers["Content-Length"] = String(fileSize);
        if (req.headers.range) headers["Content-Length"] = String(ranges.end - ranges.start + 1);
        headers["Content-Range"] = "bytes " + ranges.start + "-" + ranges.end + "/" + fileSize;
        return headers;
    }
    async rangesGet(req: express.Request, fileSize: number) {
        let g = String(req.headers.range).split("-");
        return {
            start: Number(g[0]?.replace(/\D/g, "")),
            end: Number(g[1]?.replace(/\D/g, "")) || Math.min(Number(g[0]?.replace(/\D/g, "")) + 1 * 1e7, fileSize === 0 ? 0 : fileSize - 1)
        }
    }
    async getResProcessing(req: express.Request, res: express.Response, filepath: string, fileSize: number, headers: http.OutgoingHttpHeaders | http.OutgoingHttpHeader[]) {
        if (fs.existsSync(filepath)) {
            try {
                const stream = fs.createReadStream(filepath, await this.rangesGet(req, fileSize));
                res.writeHead(req.headers.range ? 206 : 200, headers);
                stream.on("data", (chunk) => res.write(chunk));
                stream.on("end", () => res.end());
            } catch (e) {
                console.log(e, headers);
                this.error(req, res, 500);
                res.end();
            }
        } else await this.error(req, res, 404);
    }
    async error(req: express.Request, res: express.Response, errorNo: number) {
        const filepath = this.errorHtmlPath[errorNo];
        if (filepath && fs.existsSync(filepath)) {
            const fileSize = (await fsP.stat(filepath)).size;
            const headers = await this.headerGet(req, filepath, fileSize);
            if (fs.existsSync(filepath)) {
                try {
                    const stream = fs.createReadStream(filepath, await this.rangesGet(req, fileSize));
                    res.writeHead(errorNo, headers);
                    stream.on("data", (chunk) => res.write(chunk));
                    stream.on("end", () => res.end());
                } catch (e) {
                    console.log(e, headers);
                    if (errorNo === 500) res.writeHead(500);
                        else this.error(req, res, 500);
                    res.end();
                }
            }
        } else {
            res.writeHead(errorNo);
            res.end();
        }
    }
    async getResponceAuto(req: express.Request, res: express.Response, leftPathEdit?: string) {
        const url = (leftPathEdit ? leftPathEdit : "") + this.urlGet(req.url);
        if (fs.existsSync("." + url) && (await fsP.stat("." + url)).isDirectory()) return res.redirect(req.url + "/");
        console.log((new Date()).toLocaleTimeString() + ": " + this.urlGet(req.url), req.headers.host);
        const filepath = "." + url;
        if (!fs.existsSync(filepath)) return await this.error(req, res, 404);
        const fileSize = (await fsP.stat(filepath)).size;
        const headers = await this.headerGet(req, filepath, fileSize);
        await this.getResProcessing(req, res, filepath, fileSize, headers);
    }
    setAppUse(app: express.Express) {
        app.use(bodyParser.urlencoded({ limit: "127gb", extended: true }));
        app.use(bodyParser.raw({ type: '*/*' }));
        app.use(express.raw({ type: 'application/octet-stream' }));
    }
}