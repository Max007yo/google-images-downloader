"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const axios_1 = __importDefault(require("axios"));
module.exports = (fileUrl, downloadFolder, downloadStatus) => {
    return new Promise(async (resolve, reject) => {
        // Get the file name
        const fileName = path_1.default.basename(fileUrl).replace(/[^a-z0-9\.\s_-]/gi, "");
        // The path of the downloaded file on our machine
        const localFilePath = path_1.default.resolve(__dirname, downloadFolder, fileName);
        try {
            const response = await (0, axios_1.default)({
                method: 'GET',
                url: fileUrl,
                responseType: 'stream'
            });
            // writing data to a file
            const writer = response.data.pipe(fs_1.default.createWriteStream(localFilePath));
            writer.on('finish', () => resolve(localFilePath));
            writer.on('error', (err) => reject(err));
        }
        catch (err) {
            reject(err);
        }
    }).then(() => {
        downloadStatus.progress = `Images downloaded ${downloadStatus.imagesDownloaded++}`;
    });
};
