/**
 * This module provides functions for web scraping, enabling the retrieval of links and texts from specified URLs.
 * It utilizes axios for HTTP requests and cheerio for parsing and manipulating HTML.
 */


import axios from 'axios';
import cheerio from 'cheerio';

interface LinkResult {
    title: string;
    link: string | undefined;
}

interface TextResult {
    text: string;
}

/**
 * Asynchronously scrapes links from a given URL based on a specified keyword.
 * @param url The URL from which to scrape links.
 * @param keyword A keyword to filter the links by.
 * @returns A promise that resolves to an array of LinkResults.
 */
export const scrapeLinks = async (url: string, keyword: string): Promise<LinkResult[]> => {
    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);

        let results: LinkResult[] = primaryScrapingMethod($, keyword);
        
        if (results.length === 0) {
            results = await secondaryScrapingMethod(url);
        }

        return results;
    } catch (error) {
        console.error('Error during link scraping:', error);
        throw error;
    }
};


/**
 * Primary method for scraping links using predefined selectors.
 * @param $ A loaded cheerio instance to query the DOM.
 * @param keyword A keyword to filter the links by.
 * @returns An array of LinkResults.
 */
function primaryScrapingMethod($: any, keyword: string): LinkResult[] { // Changed CheerioStatic to any
    const linkSelectors = [
        // Combined selectors array
        'ul.row-content-chapter li a.chapter-name',
        'a[href]', 'ul li a', 'ol li a', 'div a', 'section a', 'nav a', 'footer a',
        'article a', 'aside a', '.link-class', '#link-id', 'p a',
        'h1 a', 'h2 a', 'h3 a', 'h4 a', 'h5 a', 'h6 a', '.navigation a',
        '.footer-links a', 'table a', '.content a', '.main-content a',
        '.sidebar a', '.post a'
    ];

    const results: LinkResult[] = [];

    linkSelectors.forEach((selector) => {
        $(selector).each((_: any, element: any) => { // Using _ for unused index, and added any type for element
            const title = $(element).text().trim();
            const link = $(element).attr('href');

            if (title.toLowerCase().includes(keyword.toLowerCase()) && link) {
                results.push({ title, link });
            }
        });
    });

    return results;
}


/**
 * Secondary method for scraping, potentially using different logic or selectors based on the URL structure.
 * @param postUrl The URL to scrape using the secondary method.
 * @returns A promise that resolves to an array of LinkResults.
 */
async function secondaryScrapingMethod(postUrl: string): Promise<LinkResult[]> {
    try {
        const headers = {
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-Requested-With': 'XMLHttpRequest',
            // Add other necessary headers here, like 'Cookie' if needed
        };

        const response = await axios.post(postUrl, {}, { headers });
        const $ = cheerio.load(response.data);
        const results: LinkResult[] = [];

        $('li.wp-manga-chapter a').each((index, element) => {
            const title = $(element).text().trim();
            const link = $(element).attr('href');
            results.push({ title, link });
        });

        return results;
    } catch (error) {
        console.error('Error during dynamic chapter scraping:', error);
        throw error;
    }
}

/**
 * Asynchronously scrapes text from a given URL based on a specified keyword.
 * @param url The URL from which to scrape text.
 * @param keyword A keyword to filter the text by.
 * @returns A promise that resolves to an array of TextResults.
 */
export const scrapeText = async (url: string, keyword: string): Promise<TextResult[]> => {
    try {
        const { data } = await axios.get(url);
        const $ = cheerio.load(data);

        const results: TextResult[] = [];
        $(`:contains(${keyword})`).each((index, element) => {
            // This assumes that the text you're interested in is in a specific element like a paragraph
            // Adjust the selector as needed to target the correct element
            const text = $(element).next().text(); 
            results.push({ text });
        });

        return results;
    } catch (error) {
        console.error('Error during text scraping:', error);
        throw error;
    }
};
