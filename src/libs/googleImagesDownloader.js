"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const puppeteer_1 = __importDefault(require("puppeteer"));
const url_1 = require("url");
const imagesSelector = '#islrg > div.islrc > div > a:nth-child(1)';
const loadMoreInputBoxSelector = '#islmp > div > div > div > div.gBPM8 > div.qvfT1 > div.YstHxe';
const msgBoxSelector = '#islmp > div > div > div > div.gBPM8 > div.qvfT1 > div.DwpMZe > div.OuJzKb.Bqq24e';
module.exports = async function (googleSearch, numOfImages, downloadStatus) {
    const browser = await puppeteer_1.default.launch();
    const page = await browser.newPage();
    const searchUrl = new url_1.URL('https://www.google.com/search?tbm=isch');
    searchUrl.searchParams.append('q', googleSearch);
    await page.goto(searchUrl.toString());
    let links = await page.$$(imagesSelector);
    downloadStatus.progress = 'Initializing...';
    while (links.length < numOfImages) {
        const loadMore = await page.$(msgBoxSelector);
        const msg = await loadMore?.evaluate(node => {
            node.scrollIntoView();
            return node.textContent;
        });
        const loadMoreInputBox = await page.$(loadMoreInputBoxSelector);
        const canClick = await loadMoreInputBox?.evaluate(node => {
            if (!node.getAttribute('style')?.includes('none'))
                return true;
            else
                return false;
        });
        if (canClick) {
            await loadMoreInputBox?.$eval('input', el => {
                const a = el;
            });
        }
        links = await page.$$(imagesSelector);
        if (msg?.includes('end'))
            break;
    }
    const images = [];
    const one = (links.length > numOfImages ? 1 / numOfImages : 1 / links.length) * 100;
    let progress = 0;
    for (let i = 0; i < links.length; i++) {
        await links[i].click();
        progress += one;
        downloadStatus.progress = `Processing Links... ${progress.toFixed(2)}%`;
        const url = await links[i].evaluate(node => node.getAttribute('href'));
        const imgUrl = new url_1.URL(searchUrl.origin + url).searchParams.get('imgurl');
        images.push(imgUrl);
        if (images.length >= numOfImages)
            break;
    }
    await browser.close();
    downloadStatus.result = images;
    return images;
};
