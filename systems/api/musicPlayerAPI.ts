import express from "express";
import fs from "fs";

/**
 * 空白文字は""でお願いします。(?やUndefinedが使用できない場合)
 */
/** ファイルのクオリティです。 */
export interface Quality {
    /** 圧縮タイプです。LossLessは可逆圧縮、Unは非圧縮、Lossyは非可逆圧縮です。 */
    CompressionType?: "LossLess" | "Un" | "Lossy";
    /** ビットレート(Kbps)です。 */
    BitRate?: number;
    /** サンプリングレートです。例:44100 */
    SamplingRate?: number;
    /**
     * 収録方式です。上から順に品質が下がります。
     * - RawAudio 生音源です。実際に作成された音源をそのまま取り込んだ場合はこちらのフラグをお使いください。
     * - PCAppRec 生音源に近い音声です。LossLessの場合で、とても低いずれしかない場合でもこちらをお使いください。
     * - MixerRec ミキサーやオーディオインターフェイスを経由したり、アナログケーブルを経由したりした生音源の場合はこちらです。
     * - MicRec マイクで生音源を収録した音声の場合はこちらです。
     */
    RecordingMethod?: "RawAudio" | "PCAppRec" | "MixerRec" | "MicRec";
    /** サンプルレートです。 */
    SampleRate?: "8bit" | "16bit" | "24bit" | "32bit float" | string;
};

/** ファイルです。 */
export interface File {
    /** 実際のファイルがある場所を指定します。 */
    filePath: string;
    /** ファイル名またはそのファイル固有の名前を付けます。 */
    name: string;
    /** そのファイルのメディアタイプを決定します。 */
    type: "image" | "sound" | "video" | "unknown";
    /** ファイルのクオリティです。 */
    quality?: Quality;
    /** ファイルデータの作成者です。ユーザーのUUIDで入力します。 */
    author: string;
    /**  */
    playCount?: {
        /** ユーザーUUIDを入力 */
        [UUID:string]: number;
    }
};

export interface BaseMusic {
    /** 曲のタイトルです。 */
    title: string;
    /** 曲の作成者です。UUIDで入力します。 */
    artist: string[];
    /** アーティストの声優です。UUIDで入力します。 */
    charactervoice: string[];
    /** リリース年または年です。 */
    releaseYear?: number;
    /** コピーライトです。複数入力することができます。 */
    copyright: string[];
};

/** 歌詞データです。１行分のデータです。 */
export interface Lyrics {
    /** 歌詞１行です。長いと改行されますが、支障はありません。30文字以上は推奨しません。改行することをお勧めします。 */
    text: string;
    /** 歌詞の文字を追うための情報です。 */
    timePerText: {
        /** どこまで読まれているかを数字で決定します。0や0.1などを設定可能で、制限はありませんが歌詞の文字数まででお願いします。 */
        length: number;
        /** どこの時間で適用するのかを決定します。 */
        viewtime: number;
    }[]
    /** どこの時間で表示するのかを範囲制で決定します。 */
    viewtime: {
        start: number;
        end: number;
    }
}

/** 曲です。 */
export interface Music extends BaseMusic {
    /** 曲の番号です。重複すると名前順になりますが、重複させないようにしてください。 */
    number: number;
    /** 作曲者です。UUIDで入力します。 */
    composer: string[];
    /** 関連するメディアです。曲に関連する音声ファイルや音声画像、ミュージックビデオなどを設定できます。 */
    files: {
        /** ファイルのUUIDを入力します。 */
        id: string;
        /** 使用用途です。defaultの場合は音声の場合は通常再生時の音声、動画の場合は通常のミュージックビデオ、画像の場合は通常の音声画像となり、less vocalは音声のみに適用可能のボーカルなしフラグ、vocal onlyは音声のみに適用可能のボーカルのみフラグです。 */
        use: "default" | "less vocal" | "vocal only";
        /** 音声のずれを補正するものです。ミュージックビデオや、ボーカルのみ音声などとの関連付けを行う場合に有効です。 */
        timeDelay: number;
    }[];
    /** 歌詞。１行ごとに配列を作成しましょう。 */
    lyrics: Lyrics[];
    /** ミュージックデータの作成者です。ユーザーのUUIDで入力します。 */
    author: string;
};

/** アルバムです。 */
export interface Album extends BaseMusic {
    /** アルバムの説明です。 */
    description: string;
    /** アルバムに関連する曲です。UUIDで入力します。 */
    musics: string[];
    /** アルバムの写真です。UUIDで入力します。 */
    albumPicture: string[];
    /** アルバムの作成者です。ユーザーのUUIDで入力します。 */
    author: string;
};

export interface Artist {
    /** アーティスト名です。 */
    name: string;
    /** アーティストの説明です。 */
    description: string;
    /** アーティスト画像です。 */
    artistPicture: string[];
    /** アーティストの作成者です。ユーザーのUUIDで入力します。 */
    author: string;
};

export interface Playlist {
    /** プレイリスト名です。 */
    name: string;
    /** プレイリストの説明です。 */
    description: string;
    /** プレイリスト画像です。 */
    playlistPicture: string[];
    /** プレイリストに関連する曲です。UUIDで入力します。 */
    musics: string[];
    /** プレイリストの作成者です。ユーザーのUUIDで入力します。 */
    author: string;
};

export class musicPlayerAPI {
    json: {
        files: { [UUID: string]: File | undefined; };
        musics: { [UUID: string]: Music | undefined; };
        albums: { [UUID: string]: Album | undefined; };
        artists: { [UUID: string]: Artist | undefined; };
        playlist: { [UUID: string]: Playlist | undefined; };
        /** ユーザーが他人のデータを操作した時の差分データです。 */
        diff: {
            /** ユーザーのUUIDで入力します。 */
            [UUID: string]: {
                files: { [UUID: string]: File | undefined; };
                musics: { [UUID: string]: Music | undefined; };
                albums: { [UUID: string]: Album | undefined; };
                artists: { [UUID: string]: Artist | undefined; };
                playlist: { [UUID: string]: Playlist | undefined; };
            };
        };
        userPreferences: {
            /** ユーザーのUUIDで入力します。 */
            [UUID: string]: {
                /** ユーザーが使用中・作成したデータ */
                owned?: {
                    files: string[];
                    musics: string[];
                    albums: string[];
                    artists: string[];
                    playlist: string[];
                };
                equalizerPreset?: {}[];
                volume?: number;
            };
        };
    } = {
            files: {},
            musics: {},
            albums: {},
            artists: {},
            playlist: {},
            diff: {},
            userPreferences: {}
        }

    constructor() {};
    async musicPlayerAPI(req: express.Request, res: express.Response) {
        /** POSTを受けた際にどの内容の場合に何を実行するかを定義しています。 */
        const post: { [name: string]: (() => Promise<void | true | string>) | undefined } = {}
        /** URLのルートパスを変更しています。(ニュアンス・説明が間違っていたらすみません。パスの一番左側を削除しています。) */
        const reqURL = (() => {
            const splitedURL = req.url.split("/");
            let text = "";
            for (let i = 2; i !== splitedURL.length; i++) text += (i !== 2 ? "/" : "") + splitedURL[i];
            return text;
        })();
        const postFunction = post[reqURL];
        if (postFunction) {
            try {
                const status = await postFunction();
                if (status === undefined || typeof status === "string") {
                    console.log(reqURL, status);
                    res.writeHead(404);
                    res.end();
                }
            } catch (e) {
                console.log(e);
                res.writeHead(500);
                res.end();
            }
        } else {
            console.log(reqURL);
            res.writeHead(404);
            res.end();
        }
    };
};