import { promisify } from 'util';
const sleep = promisify(setTimeout);

import express, { NextFunction, Request, Response } from 'express';
const app = express();

import catchAsync from './utils/catchAsync';
import { IDownloadStatus } from "./utils/downloadStatus";
import downloadImages from './libs/downloadImages';

let downloadsInProgress = new Map<string, IDownloadStatus>();
const autoDeleteTime = 15 * 60 *1000;

// MIDDLEWARE
app.use('/css', express.static(`${__dirname}/public/css`));
app.use('/img', express.static(`${__dirname}/public/img`));
app.use(express.static(`${__dirname}/../downloads`));
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.log(`Error: ${err.name}`);
    console.log(`message: ${err.message}`);
    console.log(`stack: ${err.stack}`);
});

// ROUTES
app.get('/', (req, res) => {
    res.sendFile(`${__dirname}/public/index.html`);
});

app.get('/download', (req, res, next) => {
    const id = req.query.id as string;
    const q = req.query.q as string;
    const n = parseInt(req.query.n as string);

    // if invalid query redirect to root path
    if (!id || !q) {
        res.redirect('/');
        return;
    }

    // already downloading
    if (downloadsInProgress.get(id)) {
        res.sendFile(`${__dirname}/public/loading.html`);
        return;
    }

    // adding current download request to list
    downloadsInProgress.set(id, {
        result: null,
        progress: 'Loading',
        imagesDownloaded: 0
    });

    const downloadStatus = downloadsInProgress.get(id) as IDownloadStatus;

    // start download
    downloadImages(q, n, downloadStatus, id).catch(err => {
        downloadStatus.error = true,
        downloadStatus.result = err
    });

    // auto delete this download after 30 minuets
    setTimeout(() => downloadsInProgress.delete(id), autoDeleteTime);

    res.sendFile(`${__dirname}/public/loading.html`);
});

app.get('/download-status/:id', catchAsync(async (req: Request, res: Response) => {
    const downloadStatus = downloadsInProgress.get(req.params.id) as IDownloadStatus;
    await sleep(1000);

    if(!downloadStatus.error) {
        res.json({
            status: 'success',
            data: downloadStatus
        });
    }else {
        res.json({
            status: 'fail',
            message: downloadStatus.result.message
        });
    }
}));

app.get('*.zip', (req, res) => {
    res.send('<h1>404 File Not Found!</h1>');
});

app.all('*', (req, res) => {
    res.send('<h1>404 Requested URL Not Found!</h1>');
});

const PORT = process.env.PORT || 3000;

// SERVER
app.listen(PORT, () => {
    console.log('listening on PORT:3000');
});
