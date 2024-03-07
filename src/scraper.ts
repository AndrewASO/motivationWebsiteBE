/**
 * This is for gathering information via webscrapping
 * There's the url that you can send along with a key word to scrap 
 * for that information
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


//I need to change this for working w the fantranslations website and it could be any link or if its fantranslations
//then it'll go straight to this 
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
