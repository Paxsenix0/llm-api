process
    .on('unhandledRejection', (reason, p) => {
        console.error(reason, 'Unhandled Rejection at Promise', p);
    })
    .on('uncaughtException', (err) => {
        console.error(err, 'Uncaught Exception thrown');
        process.exit(1);
    });

import LlmScraper from './llm-scraper.js';
import webServer from './web-server.js';

const scraper = new LlmScraper();
const server = new webServer(scraper);

scraper.start();
server.start();
/*
let llmResponse = await scraper.query('Write a 10 line poem about th');

console.log(llmResponse.responseText);

console.log(
    (await scraper.query('continue', 'd4298d3b-72d8-4f6e-8598-6873b1e4d5a8'))
        .responseText
);
*/
