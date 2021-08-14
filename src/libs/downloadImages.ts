import fs from 'fs';
import googleImagesDownloader from "./googleImagesDownloader";
import fileDownloader from "./fileDownloader";
import zipFolder from "../utils/zipFolder";
import { IDownloadStatus } from "../utils/downloadStatus";

export = async (search: string,
    numOfImages: number, 
    downloadStatus: IDownloadStatus,
    downloadId: string) => {

    const saveFolderPath = `${__dirname}/../../downloads/${downloadId}`;
    const saveFilePath = `${__dirname}/../../downloads/${downloadId}.zip`;

    fs.mkdirSync(saveFolderPath, { recursive: true});

    await googleImagesDownloader(search, numOfImages, downloadStatus);

    const imageUrls = downloadStatus.result;
    const downloads = imageUrls.map((imageUrl: string) => {
        return fileDownloader(imageUrl, saveFolderPath, downloadStatus)
    });
    
    await Promise.allSettled(downloads);

    zipFolder(saveFolderPath, saveFilePath);

    downloadStatus.result = `/${downloadId}.zip`
    downloadStatus.isDone = true;
}