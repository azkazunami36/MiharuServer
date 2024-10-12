import express from "express";
// 自作モジュール
import GetResponse from "./systems/modules/getResponse.js";
import UserManageApp from "./systems/app/userManage.js";
import serverStartup from "./systems/modules/serverStartup.js";
import rootingSet from "./systems/modules/rootingSet.js";

(async () => {
    // 定義と初期化
    const getResponse = new GetResponse();
    const userManageApp = new UserManageApp();
    await userManageApp.userIndex.readJSON();
    const app = express();
    // サーバーをセッティング
    serverStartup(app, getResponse, userManageApp);
    rootingSet(app);
})();
