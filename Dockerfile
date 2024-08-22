FROM node:lts-alpine
ENV NODE_ENV=production
WORKDIR /usr/src/app
RUN apt-get update
RUN apt-get install -y chromium libxss1
COPY ["package.json", "package-lock.json*", "npm-shrinkwrap.json*", "./"]
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD true
ENV PUPPETEER_EXECUTABLE_PATH /usr/bin/chromium
RUN npm install --production --silent && mv node_modules ../
COPY . .
EXPOSE 3000
RUN chown -R node /usr/src/app
USER node
CMD ["npm", "start"]