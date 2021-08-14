"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("util");
const sleep = (0, util_1.promisify)(setTimeout);
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const catchAsync_1 = __importDefault(require("./utils/catchAsync"));
const downloadImages_1 = __importDefault(require("./libs/downloadImages"));
let downloadsInProgress = new Map();
const autoDeleteTime = 15 * 60 * 1000;
// MIDDLEWARE
app.use('/css', express_1.default.static(`${__dirname}/public/css`));
app.use('/img', express_1.default.static(`${__dirname}/public/img`));
app.use(express_1.default.static(`${__dirname}/../downloads`));
app.use((err, req, res, next) => {
    console.log(`Error: ${err.name}`);
    console.log(`message: ${err.message}`);
    console.log(`stack: ${err.stack}`);
});
// ROUTES
app.get('/', (req, res) => {
    res.sendFile(`${__dirname}/public/index.html`);
});
app.get('/download', (req, res, next) => {
    const id = req.query.id;
    const q = req.query.q;
    const n = parseInt(req.query.n);
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
    const downloadStatus = downloadsInProgress.get(id);
    // start download
    (0, downloadImages_1.default)(q, n, downloadStatus, id).catch(err => {
        downloadStatus.error = true,
            downloadStatus.result = err;
    });
    // auto delete this download after 30 minuets
    setTimeout(() => downloadsInProgress.delete(id), autoDeleteTime);
    res.sendFile(`${__dirname}/public/loading.html`);
});
app.get('/download-status/:id', (0, catchAsync_1.default)(async (req, res) => {
    const downloadStatus = downloadsInProgress.get(req.params.id);
    await sleep(1000);
    if (!downloadStatus.error) {
        res.json({
            status: 'success',
            data: downloadStatus
        });
    }
    else {
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
