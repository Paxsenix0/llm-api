import express from 'express';
import swaggerUI from 'swagger-ui-express';
import swaggerSpec from './swagger.js';
import fs from 'fs';

export default class webServer {
    constructor(scraper) {
        this.scraper = scraper;
        this.app = express();
        this.app.use(
            '/api-docs',
            swaggerUI.serve,
            swaggerUI.setup(swaggerSpec)
        );
    }
    loadRoutes() {
        let routesPath = './routes';
        let files = fs.readdirSync(routesPath);
        files.forEach(async (file) => {
            let route = await import(`${routesPath}/${file}`);
            route.default(this.app, this.scraper);
        });
    }
    start() {
        this.loadRoutes();
        this.app.listen(3241, () => {
            console.log('Server is running on http://127.0.0.1:3000');
        });
    }
}
