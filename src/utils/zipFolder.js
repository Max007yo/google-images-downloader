"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const cross_zip_1 = __importDefault(require("cross-zip"));
module.exports = (inputFolderPath, OutputFilePath) => {
    cross_zip_1.default.zipSync(inputFolderPath, OutputFilePath);
};
