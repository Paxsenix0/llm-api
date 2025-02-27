import puppeteer from 'puppeteer-extra';
import Stealth from 'puppeteer-extra-plugin-stealth';
import fs from 'fs';

puppeteer.use(Stealth());

export default class LlmScraper {
    constructor() {
        this.page = null;
        this.browser = null;
    }

    async unicodeToChar(text) {
        return text.replace(/\\u[\dA-F]{4}/gi, function (match) {
            return String.fromCharCode(parseInt(match.replace(/\\u/g, ''), 16));
        });
    }

    async login(email, password) {
        let email_input = await this.page.locator('input[name=identifier]'); //temporary locator 1
        let password_input = await this.page.locator('input[name=password]');
        let submit_button = await this.page.locator('button[name=method]');

        if (email_input && password_input && submit_button) {
            await email_input.fill(email);
            await password_input.fill(password);
            await submit_button.click();
        }
    }

    async acceptTerms(newsletter = null) {
        let terms_checkbox = await this.page.locator('button#terms');
        let newsletter_checkbox = await this.page.locator('button#newsletter');
        let accept_button = await this.page.locator(
            'button:disabled[type=submit]'
        );

        if (terms_checkbox && newsletter_checkbox && accept_button) {
            await terms_checkbox.click();
            newsletter ?? (await newsletter_checkbox.click());
            (
                await this.page.waitForSelector(
                    'button:not([disabled])[type=submit]'
                )
            ).click();
        }
    }

    async rejectCookies() {
        let reject_cookies_button = await this.page.locator(
            'button.cm__btn[data-role=necessary]'
        );

        if (reject_cookies_button) {
            await reject_cookies_button.click();
        }
    }

    async inputText(text) {
        return new Promise(async (resolve, reject) => {
            let input = await this.page.locator(
                'textarea[placeholder="Ask anything!"]'
            );

            if (!input) return;

            await input.fill(text);

            let send_button = await this.page.locator(
                'button.min-w-10:disabled'
            );

            //wait for button to be enabled
            await this.page.waitForSelector('button:not([disabled]).min-w-10');
            console.log('button enabled');
            await setTimeout(async () => {
                await this.page.locator('button.min-w-10').click();
            }, 100);

            //wait for all network requests to finish
            //await this.page.waitForNetworkIdle();
            await this.page.waitForResponse(async (response) => {
                console.log(response.url());
                if (response.url() == 'https://chat.mistral.ai/api/chat') {
                    await response.text();
                    console.log('Response finished generating.');
                    let responseText;
                    setTimeout(async () => {
                        responseText = await this.page.$eval(
                            'div.flex.h-fit.w-full.flex-col.gap-5>div:last-child>div:last-child>div',
                            (el) =>
                                [...el.children]
                                    .reduce(
                                        (a, b) => a + '\n\n' + b.textContent,
                                        ''
                                    )
                                    .slice(2)
                        );
                        resolve({
                            responseText,
                            cid: this.page.url().split('/').pop(),
                        });
                    }, 100);
                }
            });
        });
    }

    /* 
    To be Implemented:]
    */

    async start(headless) {
        return new Promise(async (resolve, reject) => {
            this.browser = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox'],
            });
            this.page = await this.browser.newPage();

            //await this.page.setViewport({ width: 640, height: 480, deviceScaleFactor: 1 });
            this.page.setDefaultNavigationTimeout(0);
            this.page.setDefaultTimeout(0);

            await this.page.setUserAgent(
                'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36'
            );

            console.log('Opening page');

            await this.page.goto('https://chat.mistral.ai/chat/');

            await this.page.waitForNetworkIdle();

            /*console.log('Logging in');

            this.login('myst.trash@gmail.com', '15937Ab!');*/

            await this.page.waitForNetworkIdle();

            console.log('Accepting terms');

            this.acceptTerms(false);

            console.log('Rejecting cookies');

            this.rejectCookies();

            await this.page.waitForSelector(
                'div.cm.cm--box[aria-hidden="true"]'
            );
            resolve();
        });
    }

    async newChat() {
        await this.page.goto('https://chat.mistral.ai/chat/');

        await this.page.waitForNetworkIdle();

        return;
    }

    async switchChat(cid) {
        await this.page.goto(`https://chat.mistral.ai/chat/${cid}`);

        await this.page.waitForNetworkIdle();

        return;
    }

    async query(text, cid) {
        //cid = chat id
        if (cid) await this.switchChat(cid);
        else await this.newChat();

        return await this.inputText(text);
    }
}
