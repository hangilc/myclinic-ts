"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const fs_1 = __importDefault(require("fs"));
const app = (0, express_1.default)();
let port = 8880;
const DATA_DIR = process.env["MYCLINIC_DATA"];
if (!DATA_DIR) {
    console.error("Cannot find env var: MYCLINIC_DATA");
    process.exit(2);
}
const DICT_FILE = `${DATA_DIR}/dict.json`;
if (!fs_1.default.existsSync(DICT_FILE)) {
    fs_1.default.writeFileSync(DICT_FILE, "{}");
}
app.get("/dict-get/:key", (req, res, next) => {
    const data = fs_1.default.readFile(DICT_FILE, { encoding: "utf8" }, (err, buffer) => {
        if (err) {
            next(err);
        }
        else {
            const key = req.params["key"];
            const dict = JSON.parse(buffer);
            const val = dict[key] ?? null;
            res.set({ "Content-Type": "application/json" });
            res.send(val);
        }
    });
});
app.listen(port, () => {
    console.log("node-server listening on port " + port);
});
