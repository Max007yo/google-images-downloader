"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const fs_1 = __importDefault(require("fs"));
const googleImagesDownloader_1 = __importDefault(require("./googleImagesDownloader"));
const fileDownloader_1 = __importDefault(require("./fileDownloader"));
const zipFolder_1 = __importDefault(require("../utils/zipFolder"));
module.exports = async (search, numOfImages, downloadStatus, downloadId) => {
    const saveFolderPath = `${__dirname}/../../downloads/${downloadId}`;
    const saveFilePath = `${__dirname}/../../downloads/${downloadId}.zip`;
    fs_1.default.mkdirSync(saveFolderPath, { recursive: true });
    await (0, googleImagesDownloader_1.default)(search, numOfImages, downloadStatus);
    const imageUrls = downloadStatus.result;
    const downloads = imageUrls.map((imageUrl) => {
        return (0, fileDownloader_1.default)(imageUrl, saveFolderPath, downloadStatus);
    });
    await Promise.allSettled(downloads);
    (0, zipFolder_1.default)(saveFolderPath, saveFilePath);
    downloadStatus.result = `/${downloadId}.zip`;
    downloadStatus.isDone = true;
};
