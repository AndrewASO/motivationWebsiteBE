"use strict";
/**
 * This is for gathering information via webscrapping
 * There's the url that you can send along with a key word to scrap
 * for that information
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.scrapeText = exports.scrapeLinks = void 0;
const axios_1 = __importDefault(require("axios"));
const cheerio_1 = __importDefault(require("cheerio"));
const scrapeLinks = (url, keyword) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data } = yield axios_1.default.get(url);
        const $ = cheerio_1.default.load(data);
        let results = primaryScrapingMethod($, keyword);
        if (results.length === 0) {
            results = yield secondaryScrapingMethod(url);
        }
        return results;
    }
    catch (error) {
        console.error('Error during link scraping:', error);
        throw error;
    }
});
exports.scrapeLinks = scrapeLinks;
function primaryScrapingMethod($, keyword) {
    const results = [];
    $('ul.row-content-chapter li a.chapter-name').each((index, element) => {
        const title = $(element).text().trim();
        const link = $(element).attr('href');
        if (link && title.toLowerCase().includes(keyword.toLowerCase())) {
            results.push({ title, link });
        }
    });
    return results;
}
//I need to change this for working w the fantranslations website and it could be any link or if its fantranslations
//then it'll go straight to this 
function secondaryScrapingMethod(postUrl) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const headers = {
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-Requested-With': 'XMLHttpRequest',
                // Add other necessary headers here, like 'Cookie' if needed
            };
            const response = yield axios_1.default.post(postUrl, {}, { headers });
            const $ = cheerio_1.default.load(response.data);
            const results = [];
            $('li.wp-manga-chapter a').each((index, element) => {
                const title = $(element).text().trim();
                const link = $(element).attr('href');
                results.push({ title, link });
            });
            return results;
        }
        catch (error) {
            console.error('Error during dynamic chapter scraping:', error);
            throw error;
        }
    });
}
const scrapeText = (url, keyword) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data } = yield axios_1.default.get(url);
        const $ = cheerio_1.default.load(data);
        const results = [];
        $(`:contains(${keyword})`).each((index, element) => {
            // This assumes that the text you're interested in is in a specific element like a paragraph
            // Adjust the selector as needed to target the correct element
            const text = $(element).next().text();
            results.push({ text });
        });
        return results;
    }
    catch (error) {
        console.error('Error during text scraping:', error);
        throw error;
    }
});
exports.scrapeText = scrapeText;
