import crossZip from 'cross-zip';

export = (inputFolderPath: string, OutputFilePath: string) => {
    crossZip.zipSync(inputFolderPath, OutputFilePath);
}
