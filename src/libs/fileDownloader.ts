import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { IDownloadStatus } from '../utils/downloadStatus'

export = (fileUrl: string, downloadFolder: string, downloadStatus: IDownloadStatus) => {
    return new Promise(async (resolve, reject) => {
        // Get the file name
        const fileName = path.basename(fileUrl).replace(/[^a-z0-9\.\s_-]/gi, "");

        // The path of the downloaded file on our machine
        const localFilePath = path.resolve(__dirname, downloadFolder, fileName);

        try {
            const response = await axios({
                method: 'GET',
                url: fileUrl,
                responseType: 'stream'
            });
            
            // writing data to a file
            const writer = response.data.pipe(fs.createWriteStream(localFilePath));
            writer.on('finish', () => resolve(localFilePath));
            writer.on('error', (err: Error) => reject(err));
        } catch (err) { reject(err); }

    }).then(() => {
        downloadStatus.progress = `Images downloaded ${downloadStatus.imagesDownloaded++}`;
    });
};